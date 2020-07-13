module.exports = async function importSuperiorSchoolingRegistration({ organizationId, superiorSchoolingRegistrationRepository, superiorSchoolingRegistrationParser }) {
  const superiorSchoolingRegistrationSet = superiorSchoolingRegistrationParser.parse();
  superiorSchoolingRegistrationSet.setOrganizationId(organizationId);
  await superiorSchoolingRegistrationRepository.saveSet(superiorSchoolingRegistrationSet);
};
