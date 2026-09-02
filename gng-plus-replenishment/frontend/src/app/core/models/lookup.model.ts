/** آیتم لیست انتخابی */
export interface LookupItem {
  id: number;
  name: string;
  code?: string | null;
  /** شناسه والد — سایت برای انبار، گروه برای کالا */
  parentId?: number | null;
}

/** آیتم لیست انتخابی مقادیر ثابت */
export interface EnumItem {
  value: number;
  key: string;
  name: string;
}
