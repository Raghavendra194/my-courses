this.writeData = function writeDate(value, done) {
  const writeCombinedResultArray = [];
  const machineProps = that.machine.variables;
  const variablename = value.variable;
  const propertyValue = value[value.variable];
  machineProps.map((props) => {
    const { name } = props;
    if (name === variablename) {
      if (value.access === 'write' && props.type === 'static') {
        let values;
        if (!{}.hasOwnProperty.call(props, 'staticvalue')) {
          values = 'static';
        } else {
          values = propertyValue;
          props.staticvalue = propertyValue;
        }
        if (values !== undefined) {
          if (/^u?int[0-9]+$/.test(props.format)) {
            values = Math.round(values);
          }
          // check if this should be an unisgned integer
          if (/^uint/.test(props.format)) {
            if (values < 0) {
              values = 0;
            }
          }
          if (_.get(that.machine.settings.model, 'deliverEntireResponse', false)) {
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
                alert.raise({ key: 'db-add-error', errorMsg: err.message });
              } else {
                alert.clear('db-add-error');
              }
            });
          } else {
            that.dataCb(that.machine, machineProps, values, (err) => {
              if (err) {
                alert.raise({ key: 'db-add-error', errorMsg: err.message });
              } else {
                alert.clear('db-add-error');
              }
            });
          }
        }
      } else if (value.access === 'write' && props.type === 'count') {
        count[variablename] = propertyValue;
        return props;
      }
    }
    return props;
  });
  return done(null);
};