import DS from 'ember-data';

const { Model, attr, belongsTo } = DS;

export default Model.extend({
  isShared: attr('boolean'),
  participantExternalId: attr('string'),
  createdAt: attr('date'),
  campaign: belongsTo('campaign'),
  user: belongsTo('user'),
});