const getNextDate = (day = 1, date) => {
    const nextDate = date ? new Date(date) : new Date();
    nextDate.setDate(nextDate.getDate() + day)
    return nextDate;
}

export default getNextDate;