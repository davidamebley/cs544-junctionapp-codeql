const _ = require('lodash')
const VotingToken = require('./model')
const mongoose = require('mongoose')

const controller = {}

controller.generateToken = (name, event, createdById) => {
    const token = new VotingToken({ name, event, createdBy: createdById })
    return token.save()
}

controller.updateToken = (id, fields) => {
    return VotingToken.findByIdAndUpdate(id, fields, { new: true })
}

controller.voteWithToken = (id, projectId) => {
    return VotingToken.findByIdAndUpdate(
        id,
        { project: projectId },
        { new: true },
    )
}

controller.getVotesByProject = async event => {
    const votingTokens = await VotingToken.find({
        event,
        isRevoked: false,
        project: { $exists: true },
    })
    const grouped = _.groupBy(votingTokens, 'project')
    const results = Object.keys(grouped).reduce((result, projectId) => {
        const projectVotes = grouped[projectId]
        result.push({
            project: projectId,
            votes: projectVotes.length,
        })
        return result
    }, [])
    return results
}

controller.getToken = id => {
    if (typeof id !== 'string' || !/^[a-fA-F0-9]{24}$/.test(id)) {
        return Promise.reject(new Error('Invalid voting token ID'))
    }
    return VotingToken.findById(new mongoose.Types.ObjectId(id))
}

controller.getTokenPublic = async id => {
    const token = await VotingToken.findById(id)

    return {
        _id: token._id,
        project: token.project,
        isRevoked: token.isRevoked,
    }
}

controller.getAllTokensForEvent = eventId => {
    return VotingToken.find({ event: eventId })
}

controller.isValidToken = id => {
    return VotingToken.findById(id).then(token => !!token && !token.isRevoked)
}

controller.revokeToken = id => {
    return VotingToken.findByIdAndUpdate(
        id,
        {
            isRevoked: true,
            revokedAt: Date.now(),
        },
        { new: true },
    )
}

module.exports = controller
