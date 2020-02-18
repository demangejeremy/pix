const { NotFoundError } = require('../../domain/errors');

module.exports = async function flagSessionResultsAsSentToPrescriber({ sessionId, sessionRepository }) {
  const integerSessionId = parseInt(sessionId);
  const NOT_FOUND_SESSION = `La session ${sessionId} n'existe pas ou son accès est restreint lors du marquage d'envoi des résultats au prescripteur`;

  if (!Number.isFinite(integerSessionId)) {
    throw new NotFoundError(NOT_FOUND_SESSION);
  }

  let session;
  try {
    session = await sessionRepository.get(sessionId);
  } catch (err) {
    throw new NotFoundError(NOT_FOUND_SESSION);
  }

  if (!session.areResultsFlaggedAsSent()) {
    session.resultsSentToPrescriberAt = new Date();
    session = await sessionRepository.update(session);
    return { resultsFlaggedAsSent: true, session };
  }

  return { resultsFlaggedAsSent: false, session };
};