'use server'

import { headers } from 'next/headers'
import { checkFormToken, hashIp, validateContact, type FieldErrors } from '@/lib/contact'
import { getPayload } from '@/lib/payload'

export type ContactState = {
  status: 'idle' | 'ok' | 'invalid' | 'error' | 'rate'
  errors?: FieldErrors
  values?: { name: string; email: string; kind: string; message: string }
}

const HOURLY_LIMIT = 3
const DAILY_LIMIT = 8

export async function sendInquiry(_prev: ContactState, form: FormData): Promise<ContactState> {
  const values = {
    name: String(form.get('name') ?? '').slice(0, 200),
    email: String(form.get('email') ?? '').slice(0, 200),
    kind: String(form.get('kind') ?? 'other'),
    message: String(form.get('message') ?? '').slice(0, 8000),
  }
  const locale = form.get('locale') === 'fa' ? 'fa' : 'en'

  // Spam traps: hidden field must stay empty; the form must not be submitted
  // within a couple of seconds of rendering. Bots get a fake success.
  if (String(form.get('website') ?? '') !== '' || !checkFormToken(String(form.get('token') ?? ''))) {
    return { status: 'ok' }
  }
  if ((values.message.match(/https?:\/\//g) ?? []).length > 3) return { status: 'ok' }

  const errors = validateContact(values)
  if (Object.keys(errors).length) return { status: 'invalid', errors, values }

  try {
    const h = await headers()
    const ip = (h.get('x-forwarded-for')?.split(',')[0] || h.get('x-real-ip') || 'unknown').trim()
    const ipHash = hashIp(ip)
    const payload = await getPayload()
    const since = (ms: number) => new Date(Date.now() - ms).toISOString()
    const [hour, day] = await Promise.all([
      payload.count({ collection: 'inquiries', overrideAccess: true, where: { and: [{ ipHash: { equals: ipHash } }, { createdAt: { greater_than: since(3_600_000) } }] } }),
      payload.count({ collection: 'inquiries', overrideAccess: true, where: { and: [{ ipHash: { equals: ipHash } }, { createdAt: { greater_than: since(86_400_000) } }] } }),
    ])
    if (hour.totalDocs >= HOURLY_LIMIT || day.totalDocs >= DAILY_LIMIT) return { status: 'rate', values }

    await payload.create({
      collection: 'inquiries',
      overrideAccess: true,
      data: {
        name: values.name.trim(),
        email: values.email.trim(),
        kind: values.kind as 'other',
        subject: `${values.kind} — ${values.name.trim()}`,
        message: values.message.trim(),
        locale,
        ipHash,
      },
    })

    const settings = await payload.findGlobal({ slug: 'site-settings', overrideAccess: true })
    if (settings.notifyEmail && process.env.SMTP_HOST) {
      await payload
        .sendEmail({
          to: settings.notifyEmail,
          replyTo: values.email.trim(),
          subject: `Website inquiry (${values.kind}) — ${values.name.trim()}`,
          text: `${values.message.trim()}\n\n— ${values.name.trim()} <${values.email.trim()}>`,
        })
        .catch((err: unknown) => payload.logger.error({ err }, 'Inquiry email failed (message saved in CMS)'))
    }
    return { status: 'ok' }
  } catch (err) {
    console.error(err)
    return { status: 'error', values }
  }
}
