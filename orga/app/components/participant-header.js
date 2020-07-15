import Component from '@ember/component';
import { htmlSafe } from '@ember/string';

export default class ParticipantHeaderComponent extends Component {
  get progressBarStyle() {
    return htmlSafe(`width: ${this.campaignParticipation.campaignParticipationResult.get('percentageProgression')}px`);
  }
}
