const { getSchemeIds } = require('ffc-pay-schemes')
const { warnings } = require('../database')
const { MANUAL } = getSchemeIds()

const removeWarnings = async (agreementNumber, frn, schemeId, usesContractNumber, pillar, transaction) => {
  const agreementKey = usesContractNumber ? 'contractNumber' : 'agreementNumber'

  await warnings(transaction ?? undefined)
    .whereRaw(`"data" #>> '{${agreementKey}}' = ?`, [agreementNumber])
    .whereRaw('(data->>\'frn\')::int = ?', [Number(frn)])
    .whereRaw('(data->>\'schemeId\')::int = ?', [Number(schemeId)])
    .modify((query) => {
      if (schemeId === MANUAL && pillar) {
        query.whereRaw('"data" #>> \'{pillar}\' = ?', [pillar])
      }
    })
    .del()
}

module.exports = {
  removeWarnings
}
