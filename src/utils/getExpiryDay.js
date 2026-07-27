const getExpiryDay = (createdAt, days) => {
    const day = 24 * 60 * 60 * 1000;
    const creationDate = new Date(createdAt);
    const currentDate = new Date();

    return days - Math.round(Math.abs((currentDate - creationDate) / day));
}

export default getExpiryDay;