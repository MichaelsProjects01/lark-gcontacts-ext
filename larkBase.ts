import { bitable } from '@lark-base-open/js-sdk';
import { Contact } from './googleApi';

// These names must match your Lark Base column names exactly
const FIELDS = {
  name: 'Name',
  email: 'Email',
  phone: 'Phone',
  company: 'Company',
};

const getFieldMap = async (table: Awaited<ReturnType<typeof bitable.base.getActiveTable>>) => {
  const fields = await table.getFieldMetaList();
  const map: Record<string, string> = {};
  fields.forEach((f) => { map[f.name] = f.id; });
  return map;
};

export const writeContact = async (contact: Contact): Promise<void> => {
  const table = await bitable.base.getActiveTable();
  const selection = await bitable.base.getSelection();

  if (!selection.recordId) {
    throw new Error('No row selected — click a row in the table first, then try again.');
  }

  const fieldMap = await getFieldMap(table);
  const { recordId } = selection;

  const pairs: [string, string][] = [
    [FIELDS.name, contact.name],
    [FIELDS.email, contact.email],
    [FIELDS.phone, contact.phone],
    [FIELDS.company, contact.company],
  ];

  for (const [fieldName, value] of pairs) {
    if (value && fieldMap[fieldName]) {
      try {
        await table.setCellValue(fieldMap[fieldName], recordId, value);
      } catch {
        // Field may have a special type — try segment format
        await table.setCellValue(fieldMap[fieldName], recordId, [
          { type: 'text', text: value },
        ]);
      }
    }
  }
};

export const readCurrentRecord = async (): Promise<Partial<Contact>> => {
  try {
    const table = await bitable.base.getActiveTable();
    const selection = await bitable.base.getSelection();
    if (!selection.recordId) return {};

    const fieldMap = await getFieldMap(table);
    const { recordId } = selection;

    const read = async (fieldName: string): Promise<string> => {
      const fid = fieldMap[fieldName];
      if (!fid) return '';
      const val = await table.getCellValue(fid, recordId);
      if (!val) return '';
      if (Array.isArray(val)) return val.map((s: any) => s.text || s).join('');
      return String(val);
    };

    const [name, email, phone, company] = await Promise.all([
      read(FIELDS.name),
      read(FIELDS.email),
      read(FIELDS.phone),
      read(FIELDS.company),
    ]);

    return { name, email, phone, company };
  } catch {
    return {};
  }
};
