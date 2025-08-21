import { ValueCheckingMode, OperationMode, JsonConvert } from 'json2typescript';

const jsonConvert = new JsonConvert(OperationMode.ENABLE, ValueCheckingMode.ALLOW_NULL, true);

export default jsonConvert;
