'use client'

import { useActionState, useEffect, useRef } from 'react'
import type { ContactState } from '@/app/(frontend)/[locale]/contact/actions'
import type { Dict, Locale } from '@/lib/i18n'

type Action = (prev: ContactState, form: FormData) => Promise<ContactState>

export function ContactForm({ action, token, locale, d }: { action: Action; token: string; locale: Locale; d: Dict['form'] }) {
  const [state, formAction, pending] = useActionState(action, { status: 'idle' })
  const statusRef = useRef<HTMLDivElement>(null)
  const e = state.errors ?? {}
  const v = state.values

  useEffect(() => {
    if (state.status !== 'idle') statusRef.current?.focus()
  }, [state])

  const msg = (k?: string) => (k === 'required' ? d.required : k === 'badEmail' ? d.badEmail : k === 'tooShort' ? d.tooShort : '')

  if (state.status === 'ok') {
    return (
      <div ref={statusRef} tabIndex={-1} className="form-status" data-kind="ok" role="status">
        {d.success}
      </div>
    )
  }

  return (
    <form action={formAction} noValidate aria-labelledby="form-h">
      <h2 id="form-h" className="label" style={{ marginBlockEnd: 'var(--s-5)' }}>
        {d.title}
      </h2>
      <div ref={statusRef} tabIndex={-1} aria-live="polite">
        {state.status === 'invalid' && <p className="form-status" data-kind="error">{d.invalid}</p>}
        {state.status === 'error' && <p className="form-status" data-kind="error">{d.error}</p>}
        {state.status === 'rate' && <p className="form-status" data-kind="error">{d.rate}</p>}
      </div>
      <input type="hidden" name="token" value={token} />
      <input type="hidden" name="locale" value={locale} />
      <div className="hp" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="field">
        <label htmlFor="c-name">{d.name}</label>
        <input id="c-name" name="name" autoComplete="name" required defaultValue={v?.name} aria-invalid={!!e.name} aria-describedby={e.name ? 'c-name-err' : undefined} />
        {e.name && <span id="c-name-err" className="err">{msg(e.name)}</span>}
      </div>
      <div className="field">
        <label htmlFor="c-email">{d.email}</label>
        <input id="c-email" name="email" type="email" dir="ltr" autoComplete="email" required defaultValue={v?.email} aria-invalid={!!e.email} aria-describedby={e.email ? 'c-email-err' : undefined} />
        {e.email && <span id="c-email-err" className="err">{msg(e.email)}</span>}
      </div>
      <div className="field">
        <label htmlFor="c-kind">{d.kind}</label>
        <select id="c-kind" name="kind" defaultValue={v?.kind ?? 'exhibition'}>
          {Object.entries(d.kinds).map(([k, label]) => (
            <option key={k} value={k}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="c-msg">{d.message}</label>
        <textarea id="c-msg" name="message" required defaultValue={v?.message} aria-invalid={!!e.message} aria-describedby={e.message ? 'c-msg-err' : undefined} />
        {e.message && <span id="c-msg-err" className="err">{msg(e.message)}</span>}
      </div>
      <p className="caption" style={{ marginBlockEnd: 'var(--s-5)' }}>{d.privacy}</p>
      <button className="button" type="submit" disabled={pending}>
        {pending ? d.sending : d.send}
      </button>
    </form>
  )
}
