const {
  SFI,
  SFI_PILOT,
  LUMP_SUMS,
  VET_VISITS,
  CS,
  BPS,
  MANUAL,
  ES,
  FC,
  IMPS,
  SFI23,
  DELINKED,
  SFI_EXPANDED,
  COHT_REVENUE,
  COHT_CAPITAL
} = require('./schemes')

module.exports = {
  [SFI]: 'SFI',
  [SFI_PILOT]: 'SFI Pilot',
  [LUMP_SUMS]: 'Lump Sums',
  [VET_VISITS]: 'Vet Visits',
  [CS]: 'CS',
  [BPS]: 'BPS',
  [MANUAL]: 'Manual',
  [ES]: 'ES',
  [FC]: 'FC',
  [IMPS]: 'IMPS',
  [SFI23]: 'SFI23',
  [DELINKED]: 'Delinked',
  [SFI_EXPANDED]: 'Expanded SFI Offer',
  [COHT_REVENUE]: 'COHT Revenue',
  [COHT_CAPITAL]: 'COHT Capital'
}
