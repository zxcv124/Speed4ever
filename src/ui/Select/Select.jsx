import withFormItem from "../withFormItem/withFormItem";

const Select = ({ children, ...props }) => <select {...props}>{children}</select>

export default withFormItem(Select);