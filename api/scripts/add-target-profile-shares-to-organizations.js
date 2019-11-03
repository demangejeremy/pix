/* eslint-disable no-console */
// Usage: BASE_URL=... PIXMASTER_EMAIL=... PIXMASTER_PASSWORD=... node add-target-profile-shares-to-organizations.js path/file.csv
// To use on file with columns |externalId, [targetProfileId-targetProfileId-targetProfileId]|

'use strict';
require('dotenv').config();
const request = require('request-promise-native');
const targetProfileShareRepository = require('../lib/infrastructure/repositories/target-profile-share-repository');
const _ = require('lodash');
const { checkCsvExtensionFile, parseCsv } = require('./helpers/csvHelpers');

const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

function organizeOrganizationsByExternalId(data) {
  const organizationsByExternalId = {};

  data.forEach((organization) => {
    if (organization.attributes['external-id']) {
      organization.attributes['external-id'] = organization.attributes['external-id'].toUpperCase();
      organizationsByExternalId[organization.attributes['external-id']] = { id: organization.id, ...organization.attributes };
    }
  });

  return organizationsByExternalId;
}

async function addTargetProfileSharesToOrganizations({ organizationsByExternalId, csvData }) {
  for (let i = 0; i < csvData.length; i++) {
    const [externalIdLowerCase, targetProfileList] = csvData[i];

    if (!(externalIdLowerCase && targetProfileList)) {
      return console.log('Found empty line in input file.');
    }
    if (!externalIdLowerCase) {
      return console.log('A line is missing an externalId.', targetProfileList);
    }
    if (!targetProfileList) {
      return console.log('A line is missing a targetProfileIdList', externalIdLowerCase);
    }

    if (require.main === module) {
      console.log(`${i + 1}/${csvData.length}`);
    }

    //TODO j'ai un problème icin je n'arrive pas à récupérer le `organizationsByExternalId[externalId]` du premier élément de l'objet.
    // Donc il n'ajoute j'amais la première ligne du CSV. C'est dommage car l'objet `organizationsByExternalId` à lui bien l'ensemble des organizations.
    // Juste le get se passe mal… Et la j'ai pas trop d'idée, il me faut un canard !!

    const externalId = externalIdLowerCase.toUpperCase();
    const existingOrganization = organizationsByExternalId[externalId];
    const targetProfileIdList = targetProfileList.split('-');

    /*    console.log('i: ', i)
        console.log('externalId: ', externalId)
        console.log('object: ', existingOrganization)*/

    // corrige l’erreur remonté par le `existingOrganization = undefined`lié au problèle de la première ligne…
    if (existingOrganization && existingOrganization.id) {
      console.log(`Adding targetProfiles ${targetProfileList} to organizationId: ${existingOrganization.id}…`);
      await targetProfileShareRepository.addToOrganization({
        organizationId: existingOrganization.id,
        targetProfileIdList
      });
      console.log('Ok.');
    }
  }
}

function _buildAccessTokenRequestObject() {
  return {
    method: 'POST',
    baseUrl,
    url: '/api/token',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    form: {
      grant_type: 'password',
      username: process.env.PIXMASTER_EMAIL,
      password: process.env.PIXMASTER_PASSWORD,
    },
    json: true,
  };
}

function _buildGetOrganizationsRequestObject(accessToken) {
  return {
    method: 'GET',
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
    baseUrl,
    url: '/api/organizations?pageSize=999999999',
    json: true,
  };
}

async function main() {
  console.log('Starting script add-target-profile-shares-to-organizations');

  try {
    const filePath = process.argv[2];

    console.log('Check csv extension file... ');
    checkCsvExtensionFile(filePath);
    console.log('ok');

    console.log('Reading and parsing csv data file... ');
    const csvData = parseCsv(filePath);
    console.log('ok');

    console.log('Requesting API access token... ');
    const { access_token: accessToken } = await request(_buildAccessTokenRequestObject());
    console.log('ok');

    console.log('Fetching existing organizations... ');
    const { data: organizations } = await request(_buildGetOrganizationsRequestObject(accessToken));
    const organizationsByExternalId = organizeOrganizationsByExternalId(organizations);
    console.log('ok');

    console.log('Adding target profiles shares to organizations…');
    await addTargetProfileSharesToOrganizations({ organizationsByExternalId, csvData });
    console.log('\nDone.');

  } catch (error) {
    console.error(error);

    process.exit(1);
  }
}

if (require.main === module) {
  main().then(
    () => process.exit(0),
    (err) => {
      console.error(err);
      process.exit(1);
    }
  );
}

module.exports = {
  organizeOrganizationsByExternalId,
  addTargetProfileSharesToOrganizations,
};
