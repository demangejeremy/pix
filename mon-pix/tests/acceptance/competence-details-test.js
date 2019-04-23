import {
  afterEach,
  beforeEach,
  describe,
  it,
} from 'mocha';
import { expect } from 'chai';
import { authenticateAsPrescriber, authenticateAsSimpleUser } from '../helpers/testing';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';
import defaultScenario from '../../mirage/scenarios/default';

describe('Acceptance | Competence details | Afficher la page de detail d\'une compétence', () => {
  let application;

  beforeEach(() => {
    application = startApp();
    defaultScenario(server);
  });

  afterEach(() => {
    destroyApp(application);
  });

  describe('Authenticated cases as simple user', () => {

    beforeEach(async () => {
      await authenticateAsSimpleUser();
    });

    it('can visit /competences/1_1', async () => {
      // when
      await visit('/competences/1_1');

      // then
      expect(currentURL()).to.equal('/competences/1_1');
    });

    it('displays the competence details', async () => {
      // given
      const name = 'Super compétence';
      const description = 'Super description de la compétence';
      const earnedPix = 7;
      const level = 4;
      const pixScoreAheadOfNextLevel= 5;
      const area = server.schema.areas.find(1);

      const scorecard = server.create('scorecard', {
        id: '1_1',
        name,
        description,
        earnedPix,
        level,
        pixScoreAheadOfNextLevel,
        area,
      });

      // when
      await visit(`/competences/${scorecard.id}`);

      // then
      expect(find('.competence-details-panel-content-left__area').text()).to.contain(area.title);
      expect(find('.competence-details-panel-content-left__area').attr('class')).to.contain('competence-details-panel-content-left__area--jaffa');
      expect(find('.competence-details-panel-content-left__name').text()).to.contain(name);
      expect(find('.competence-details-panel-content-left__description').text()).to.contain(description);
      expect(find('.competence-card-level__value').text()).to.contain(level);
      expect(find('.competence-details-panel-content-right-score-container-pix-earned__number').text()).to.contain(earnedPix);
      expect(find('.competence-details-panel-content-right__level-info').text()).to.contain(`${8 - pixScoreAheadOfNextLevel} pix avant niveau ${level + 1}`);
    });

    it('Does not display pixScoreAheadOfNextLevelwhen next level is over the max level', async () => {
      // given
      const scorecard = server.create('scorecard', {
        id: '1_1',
        name: 'Super compétence',
        earnedPix: 7,
        level: 999,
        pixScoreAheadOfNextLevel: 5,
        area: server.schema.areas.find(1),
      });

      // when
      await visit(`/competence/${scorecard.id}`);

      // then
      expect(find('.competence-details-panel-content-right__level-info')).to.have.lengthOf(0);
    });
  });

  describe('Authenticated cases as user with organization', () => {
    beforeEach(async () => {
      await authenticateAsPrescriber();
    });

    it('can visit /competences/1_1', async () => {
      // when
      await visit('/competences/1_1');

      // then
      expect(currentURL()).to.equal('/board');
    });
  });

  describe('Not authenticated cases', () => {
    it('should redirect to home, when user is not authenticated', async () => {
      // when
      await visit('/competences/1_1');
      expect(currentURL()).to.equal('/connexion');
    });
  });
});