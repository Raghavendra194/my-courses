let machine = [{ "name": "TestWriteVar", "description": "TestWriteVar", "format": "int16", "type": "static", "staticvalue": "1565" }]

function writeData(value, done) {
    for (let val of value) {
        let variableName = val.variable;
        let propertyValue = val[val.variable];
        let res = machine.map((value1) => {
            if (value1.name === variableName) {
                if (val.access === 'write' && value1.type === 'static') {
                    value1.staticvalue = propertyValue;
                    return value1;
                }
                else if (val.access === 'write' && value1.type === 'count') {
                    count[variableName] = propertyValue;
                    return value1;
                }
            }
        });

        console.log(res);
    }

}

let value = [{ "machine": "TestMachine", "variable": "TestWriteVar", "access": "write", "TestWriteVar": 103, "_id": 105, "createdAt": "2023-08-03T15:52:48.578Z" }];


writeData(value, 'done');

this.writeData = function writeData(value, done) {
    let machineProps = that.machine.variables;
    let variablename = value.variable;
    let propertyValue = value[value.variable];
    let res = machineProps.map((props) => {
        if (props.name === variablename) {
            if (value.access === 'write' && props.type === 'static') {
                props.staticvalue = propertyValue;
                return props;
            }
            else if (value.access === 'write' && props.type === 'count') {
                count[variablename] = propertyValue;
                return props;
            }
        }
    });

}

this.writeData = function writeDate(value, done) {
    let machineProps = that.machine.variables;
    let variablename = value.variable;
    let propertyValue = value[value.variable];
    let res = macineProps.map((props) => {
        if (props.name === variablename) {
            if (value.access === 'write' && props.type === 'static') {
                let value;
                if (!{}.hasOwnProperty.call(props, 'staticvalue')) {
                    value = 'static';
                } else {
                    value = propetyvalue;
                }
                that.dataCb(that.machine, props, value, (err) => {
                    if (err) {
                        alert.raise({ key: 'db-add-error', errorMsg: err.message });
                    } else {
                        alert.clear('db-add-error');
                    }
                });

                //props.staticvalue = propetyvalue;


                return props;
            }
            else if (value.access === 'write' && props.type === 'count') {
                count[variablename] = propertyValue;
                return props;
            }
        }
    });
}



this.writeData = function writeDate(value, done) {
    let machineProps = that.machine.variables;
    let variablename = value.variable;
    let propertyValue = value[value.variable];
    let res = machineProps.map((props) => {
        if (props.name === variablename) {
            if (value.access === 'write' && props.type === 'static') {
                let value;
                if (!{}.hasOwnProperty.call(props, 'staticvalue')) {
                    value = 'static';
                }
                else {
                    value = propertyValue;
                    props.staticvalue = propertyValue;
                }

                return props;
            }
            else if (value.access === 'write' && props.type === 'count') {
                count[variablename] = propertyValue; return props;
            }
        }
    });
}




this.writeData = function writeDate(value, done) {
    let writeCombinedResultArray = [];
    let machineProps = that.machine.variables;
    let variablename = value.variable;
    let propertyValue = value[value.variable];
    let res = machineProps.map((props) => {
        if (props.name === variablename) {
            if (value.access === 'write' && props.type === 'static') {
                let values;
                if (!{}.hasOwnProperty.call(props, 'staticvalue')) {
                    values = 'static';
                } else {
                    values = propertyValue;
                    props.staticvalue = propertyValue;
                }
                const data = {
                    name: props.name,
                    values,
                };
                if (_.has(machineProps, 'min')) {
                    data.lowerLimit = props.min;
                }
                if (_.has(machineProps, 'max')) {
                    data.upperLimit = props.max;
                }
                writeCombinedResultArray.push(data);
                that.dataCb(that.machine, machineProps, writeCombinedResultArray, (err) => {
                    if (err) {
                        alert.raise({
                            key: 'db-add-error',
                            errorMsg: err.message
                        });
                    } else {
                        alert.clear('db-add-error');
                    }
                });
                return props;
            } else if (value.access === 'write' && props.type === 'count') {
                count[variablename] = propertyValue;
                return props;
            }
        }
    });
    return done(null);
}


