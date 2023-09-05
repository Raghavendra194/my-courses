try {
    const streamTable = Things[PlantThing].KPI_Plant_Stream;
    const shiftTrackerTable = Things[PlantThing].shift_tracker_DT;
    const timeZoneOffset = Things[PlantThing].timezoneoffset;
    let currentDate = dateAddHours(new Date(), timeZoneOffset);
    let previousDate = dateAddHours(new Date(), timeZoneOffset);
    previousDate.setDate(currentDate.getDate() - 1);
    let formattedCurrentDate = dateFormat(currentDate, "yyyy-MM-dd");
    let formattedPreviousDate = dateFormat(previousDate, "yyyy-MM-dd");
    let time, shiftNumber;
    let largerBetterValue;
    let mostRecentValue = false;
    let currentKPITimestamp;
    let finalData;
    // Get Larger better localized value
    let paramsLargerBetter = {
        token: "TE.KPI.LargerBetter" /* STRING */
    };
    let largerBetterLocalized = Resources["RuntimeLocalizationFunctions"].GetEffectiveToken(paramsLargerBetter);

    let paramsUseRecentValue = {
        token: "TE.KPI.UseRecentValue" /* STRING */
    };
    let mostRecentValueLocalized = Resources["RuntimeLocalizationFunctions"].GetEffectiveToken(paramsUseRecentValue);

    // Get the Larger better property value from kpiparams
    if (KPIParams != undefined) {
        for (let i = 0; i < KPIParams.fields.length; i++) {
            trimName1 = KPIParams.fields[i].propertyName.slice(2);
            trimName2 = trimName1.slice(0, -2);
            // Get the localized property name
            params = {
                token: trimName2 /* STRING */
            };
            propertyNameLocalized = Resources["RuntimeLocalizationFunctions"].GetEffectiveToken(params);
            if (largerBetterLocalized == propertyNameLocalized) {
                largerBetterValue = KPIParams.fields[i].propertyValue;
                break;
            } if (mostRecentValueLocalized == propertyNameLocalized) {
                mostRecentValue = KPIParams.fields[i].propertyValue;
            }
        }
    }

    if (TimePeriod === "Current_Day") {
        time = formattedCurrentDate;
        shiftNumber = 0;
    } else if (TimePeriod === "Previous_Day") {
        time = formattedPreviousDate;
        shiftNumber = 0;
    }
    const filteredZone = Things[shiftTrackerTable].SearchDataTableEntries({
        maxItems: undefined /* NUMBER {"defaultValue":500} */,
        searchExpression: TierThing /* STRING */,
        query: undefined /* QUERY */,
        source: undefined /* STRING */,
        tags: undefined /* TAGS */
    });
    if (TimePeriod === "Current_Shift") {
        shiftNumber = filteredZone.rows[0].new_shift;
        time = dateFormat(filteredZone.rows[0].new_shift_start_date, "yyyy-MM-dd");
    } else if (TimePeriod === "Previous_Shift") {
        shiftNumber = filteredZone.rows[0].old_shift;
        time = dateFormat(filteredZone.rows[0].old_shift_start_date, "yyyy-MM-dd");
    }
    // Query the stream data according to the selected day filter
    let query = {
        filters: {
            type: "AND",
            filters: [{
                type: "EQ",
                fieldName: "TierThing",
                value: TierThing
            },
            {
                type: "EQ",
                fieldName: "KPIName",
                value: KPIName
            },
            {
                type: "LIKE",
                fieldName: "timestamp",
                value: time + "%"
            },
            {
                type: "EQ",
                fieldName: "Shift",
                value: shiftNumber
            },
            {
                type: "EQ",
                fieldName: "Tier",
                value: "TE_Master_KPI_Manual_Thing"
            }
            ]
        }
    };
    let startTimestamp = new Date(time);
    let endTimestamp = new Date(startTimestamp.getTime() + 24 * 60 * 60 * 1000 - 1);
    let filteredTierThing = Things[streamTable].QueryStreamData({
        oldestFirst: undefined /* BOOLEAN */,
        maxItems: undefined /* NUMBER {"defaultValue":500} */,
        sourceTags: undefined /* TAGS */,
        endDate: endTimestamp /* DATETIME */,
        query: query /* QUERY */,
        source: undefined /* STRING */,
        startDate: startTimestamp /* DATETIME */,
        tags: undefined /* TAGS */
    });
    if (mostRecentValue === true && final.getRowCount() === 0) {
        query = {
            filters: {
                type: "AND",
                filters: [{
                    type: "EQ",
                    fieldName: "TierThing",
                    value: '0937_Kurim'
                },
                {
                    type: "EQ",
                    fieldName: "KPIName",
                    value: 'TestTier4ManualKPI'
                },
                {
                    type: "LT",
                    fieldName: "timestamp",
                    value: currentDate
                },
                {
                    type: "EQ",
                    fieldName: "Tier",
                    value: "TE_Master_KPI_Manual_Thing"
                }
                ]
            }
        };
        let endTimestamp = new Date(currentDate.getTime() + 1);
        filteredTierThing = Things[streamTable].QueryStreamData({
            oldestFirst: undefined /* BOOLEAN */,
            maxItems: 1 /* NUMBER {"defaultValue":500} */,
            sourceTags: undefined /* TAGS */,
            endDate: endTimestamp /* DATETIME */,
            query: query /* QUERY */,
            source: undefined /* STRING */,
            startDate: undefined /* DATETIME */,
            tags: undefined /* TAGS */
        });
    }

    if (filteredTierThing.getRowCount() === 1) {
        currentKPITimestamp = filteredTierThing.rows[0].timestamp;
    }
    // Compare the last two kpi values based on the selected time period filter.
    // It will comapare the selected time and the previous time value.
    if (currentKPITimestamp != undefined) {
        var queryToFindHistory = {
            filters: {
                type: "AND",
                filters: [{
                    type: "EQ",
                    fieldName: "TierThing",
                    value: TierThing
                },
                {
                    type: "EQ",
                    fieldName: "KPIName",
                    value: KPIName
                },
                {
                    type: "LE",
                    fieldName: "timestamp",
                    value: currentKPITimestamp
                }
                ]
            }
        };
        endTimeStamp = new Date(currentKPITimestamp.getTime() + 1);
        filteredTierThing = Things[streamTable].QueryStreamData({
            oldestFirst: false /* BOOLEAN */,
            maxItems: 2 /* NUMBER {"defaultValue":500} */,
            sourceTags: undefined /* TAGS */,
            endDate: endTimeStamp /* DATETIME */,
            query: queryToFindHistory /* QUERY */,
            source: undefined /* STRING */,
            startDate: undefined /* DATETIME */,
            tags: undefined /* TAGS */
        });
    }
    if (filteredTierThing.getRowCount() < 1) {
        result = 0;
    } else if (filteredTierThing.getRowCount() === 1) {
        result = 0;
    } else {
        let currentValue = Number(filteredTierThing.rows[0].Value);
        let previousValue = Number(filteredTierThing.rows[1].Value);
        if (currentValue === previousValue) {
            result = 5;
        } else if (currentValue >= previousValue && largerBetterValue === true) {
            result = 0;
        } else if (currentValue >= previousValue && largerBetterValue === false) {
            result = 2;
        } else if (currentValue < previousValue && largerBetterValue === true) {
            result = 3;
        } else if (currentValue < previousValue && largerBetterValue === false) {
            result = 1;
        }
    }
} catch (err) {
    logger.error("Error while getting the trend direction status inside GetTrendDirectionStatus service " + err + " on line number " + err.lineNumber);
}