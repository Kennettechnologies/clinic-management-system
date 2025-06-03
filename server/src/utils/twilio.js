const twilio = require('twilio');
const ErrorResponse = require('./errorResponse');

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const apiKey = process.env.TWILIO_API_KEY;
const apiSecret = process.env.TWILIO_API_SECRET;

const client = twilio(accountSid, authToken);

// Create a new video room
exports.createVideoRoom = async (roomName) => {
    try {
        const room = await client.video.rooms.create({
            uniqueName: roomName,
            type: 'go',
            recordParticipantsOnConnect: true,
            statusCallback: `${process.env.API_URL}/api/v1/telemedicine/webhook/room-status`,
            statusCallbackMethod: 'POST'
        });

        return room;
    } catch (err) {
        throw new ErrorResponse('Error creating video room', 500);
    }
};

// Generate access token for video room
exports.generateAccessToken = (identity, roomName) => {
    try {
        const AccessToken = twilio.jwt.AccessToken;
        const VideoGrant = AccessToken.VideoGrant;

        // Create an access token
        const token = new AccessToken(
            accountSid,
            apiKey,
            apiSecret,
            { identity: identity }
        );

        // Grant the access token Video capabilities
        const videoGrant = new VideoGrant({
            room: roomName
        });
        token.addGrant(videoGrant);

        return token.toJwt();
    } catch (err) {
        throw new ErrorResponse('Error generating access token', 500);
    }
};

// Get room status
exports.getRoomStatus = async (roomName) => {
    try {
        const room = await client.video.rooms(roomName).fetch();
        return room;
    } catch (err) {
        throw new ErrorResponse('Error fetching room status', 500);
    }
};

// End room
exports.endRoom = async (roomName) => {
    try {
        const room = await client.video.rooms(roomName).update({ status: 'completed' });
        return room;
    } catch (err) {
        throw new ErrorResponse('Error ending room', 500);
    }
};

// Get room participants
exports.getRoomParticipants = async (roomName) => {
    try {
        const participants = await client.video.rooms(roomName).participants.list();
        return participants;
    } catch (err) {
        throw new ErrorResponse('Error fetching room participants', 500);
    }
}; 