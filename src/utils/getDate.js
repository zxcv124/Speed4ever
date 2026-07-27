const getAbsDate = date => {
    const newDate = date ? new Date(date) : new Date();
    newDate.setHours(0, 0, 0, 0);
    return newDate;
}


export default getAbsDate;