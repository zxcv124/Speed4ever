const toNormalDate = date => +date ? new Date(+date).toISOString().split('T')[0] : '';

export default toNormalDate;