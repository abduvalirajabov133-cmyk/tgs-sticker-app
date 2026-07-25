import { MASTER_TEMPLATES } from './templatesData';

export function getClientTemplatePreview(templateId: string, _text?: string): any {
  const masterJson = MASTER_TEMPLATES[templateId] || MASTER_TEMPLATES['flag'];
  const cloned = JSON.parse(JSON.stringify(masterJson));
  return cloned;
}
