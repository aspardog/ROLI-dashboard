const ACTIVE_YEAR = '2025';

const REGION_OPTIONS = [
  { value: 'global',                          label: 'Global' },
  { value: 'East Asia and Pacific',           label: 'East Asia and Pacific' },
  { value: 'Eastern Europe and Central Asia', label: 'Eastern Europe and Central Asia' },
  { value: 'EU, EFTA, and North America',     label: 'EU, EFTA, and North America' },
  { value: 'Latin America and Caribbean',     label: 'Latin America and Caribbean' },
  { value: 'Middle East and North Africa',    label: 'Middle East and North Africa' },
  { value: 'South Asia',                      label: 'South Asia' },
  { value: 'Sub-Saharan Africa',              label: 'Sub-Saharan Africa' },
];


const VARIABLE_OPTIONS = [
  { value: 'roli', label: 'ROLI - Overall Index', category: 'general' },

  { value: 'f1', label: 'F1 - Constraints on Government Power', category: 'factor' },
  { value: 'f2', label: 'F2 - Absence of Corruption',          category: 'factor' },
  { value: 'f3', label: 'F3 - Open Government',                category: 'factor' },
  { value: 'f4', label: 'F4 - Fundamental Rights',             category: 'factor' },
  { value: 'f5', label: 'F5 - Order and Security',             category: 'factor' },
  { value: 'f6', label: 'F6 - Regulatory Enforcement',          category: 'factor' },
  { value: 'f7', label: 'F7 - Civil Justice',                  category: 'factor' },
  { value: 'f8', label: 'F8 - Criminal Justice',               category: 'factor' },

  { value: 'sf11', label: '1.1 - Limited by the legislature',                      category: 'sf1' },
  { value: 'sf12', label: '1.2 - Limited by the judiciary',                        category: 'sf1' },
  { value: 'sf13', label: '1.3 - Limited by independent auditing and review',      category: 'sf1' },
  { value: 'sf14', label: '1.4 - Officials sanctioned for misconduct',             category: 'sf1' },
  { value: 'sf15', label: '1.5 - Subject to non-governmental checks',              category: 'sf1' },
  { value: 'sf16', label: '1.6 - Transition of power subject to the law',          category: 'sf1' },

  { value: 'sf21', label: '2.1 - No private gain (Executive)',                     category: 'sf2' },
  { value: 'sf22', label: '2.2 - No private gain (Judicial)',                      category: 'sf2' },
  { value: 'sf23', label: '2.3 - No private gain (Police & Military)',             category: 'sf2' },
  { value: 'sf24', label: '2.4 - No private gain (Legislative)',                   category: 'sf2' },

  { value: 'sf31', label: '3.1 - Publicized laws and government data',             category: 'sf3' },
  { value: 'sf32', label: '3.2 - Right to information',                            category: 'sf3' },
  { value: 'sf33', label: '3.3 - Civic participation',                             category: 'sf3' },
  { value: 'sf34', label: '3.4 - Complaint mechanisms',                            category: 'sf3' },

  { value: 'sf41', label: '4.1 - Equal treatment and non-discrimination',          category: 'sf4' },
  { value: 'sf42', label: '4.2 - Right to life and security',                      category: 'sf4' },
  { value: 'sf43', label: '4.3 - Due process and rights of the accused',           category: 'sf4' },
  { value: 'sf44', label: '4.4 - Freedom of opinion and expression',               category: 'sf4' },
  { value: 'sf45', label: '4.5 - Freedom of belief and religion',                  category: 'sf4' },
  { value: 'sf46', label: '4.6 - Freedom from interference with privacy',          category: 'sf4' },
  { value: 'sf47', label: '4.7 - Freedom of assembly and association',             category: 'sf4' },
  { value: 'sf48', label: '4.8 - Fundamental labor rights',                        category: 'sf4' },

  { value: 'sf51', label: '5.1 - Crime is effectively controlled',                 category: 'sf5' },
  { value: 'sf52', label: '5.2 - Civil conflict is effectively limited',           category: 'sf5' },
  { value: 'sf53', label: '5.3 - No violence to redress personal grievances',      category: 'sf5' },

  { value: 'sf61', label: '6.1 - Regulations are effectively enforced',            category: 'sf6' },
  { value: 'sf62', label: '6.2 - Enforced without improper influence',             category: 'sf6' },
  { value: 'sf63', label: '6.3 - No unreasonable delay in proceedings',            category: 'sf6' },
  { value: 'sf64', label: '6.4 - Due process in administrative proceedings',       category: 'sf6' },
  { value: 'sf65', label: '6.5 - No expropriation without lawful process',         category: 'sf6' },

  { value: 'sf71', label: '7.1 - Access and affordability',                        category: 'sf7' },
  { value: 'sf72', label: '7.2 - Free of discrimination',                          category: 'sf7' },
  { value: 'sf73', label: '7.3 - Free of corruption',                              category: 'sf7' },
  { value: 'sf74', label: '7.4 - Free of improper government influence',           category: 'sf7' },
  { value: 'sf75', label: '7.5 - Not subject to unreasonable delay',               category: 'sf7' },
  { value: 'sf76', label: '7.6 - Effectively enforced',                            category: 'sf7' },
  { value: 'sf77', label: '7.7 - Accessible alternative dispute resolution',       category: 'sf7' },

  { value: 'sf81', label: '8.1 - Investigation system is effective',               category: 'sf8' },
  { value: 'sf82', label: '8.2 - Adjudication is timely and effective',            category: 'sf8' },
  { value: 'sf83', label: '8.3 - Correctional system reduces criminal behavior',   category: 'sf8' },
  { value: 'sf84', label: '8.4 - Criminal system is impartial',                    category: 'sf8' },
  { value: 'sf85', label: '8.5 - Free of corruption',                              category: 'sf8' },
  { value: 'sf86', label: '8.6 - Free of improper government influence',           category: 'sf8' },
  { value: 'sf87', label: '8.7 - Due process and rights of the accused',           category: 'sf8' },
];

const SUBFACTOR_GROUPS = [
  { label: 'F1 - Constraints on Government Power', category: 'sf1' },
  { label: 'F2 - Absence of Corruption',           category: 'sf2' },
  { label: 'F3 - Open Government',                 category: 'sf3' },
  { label: 'F4 - Fundamental Rights',              category: 'sf4' },
  { label: 'F5 - Order and Security',              category: 'sf5' },
  { label: 'F6 - Regulatory Enforcement',           category: 'sf6' },
  { label: 'F7 - Civil Justice',                   category: 'sf7' },
  { label: 'F8 - Criminal Justice',                category: 'sf8' },
];

const COLORS = {
  top5: '#003B88',
  bottom5: '#fa4d57',
  background: '#f8f7f4',
  text: '#1a1a1a',
  muted: '#6b6b6b',
  divider: '#333333',
};

const TS_COLORS = { line: '#181878', axis: '#514e4b', grid: '#BDBDBD' };

export { ACTIVE_YEAR, REGION_OPTIONS, VARIABLE_OPTIONS, SUBFACTOR_GROUPS, COLORS, TS_COLORS };
