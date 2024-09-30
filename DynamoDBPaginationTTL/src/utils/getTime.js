// get the current time in milliseconds
const currentTime = new Date().getTime();

const getCurrentTime = () => {
    // converting the current time to epoch second format
    const createdAt = Math.floor(currentTime / 1000) 
    return createdAt;
}
const getExpireAt = (days) => {
    // setting the expireAt attribute to 90 days from the current time
    const expireAt = Math.floor((currentTime + days * 24 * 60 * 60 * 1000) / 1000);
    return expireAt;
}

module.exports = {
    getExpireAt,
    getCurrentTime,
}