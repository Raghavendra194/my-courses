let CustomFields = {
    "fields": [
        {
            "propertyName": "[[TE.KPI.DisplayFormat]]",
            "propertyType": "Choice",
            "propertyValue": "Integer",
            "required": false
        },
        {
            "propertyName": "[[TE.KPI.KeepHistory]]",
            "propertyType": "CheckBox",
            "propertyValue": false,
            "required": false
        },
        {
            "propertyComparator": ">",
            "propertyName": "[[TE.KPI.GreenSpec]]",
            "propertyType": "ColorRange",
            "propertyValue": "10",
            "required": false
        },
        {
            "propertyComparator": "<",
            "propertyName": "[[TE.KPI.RedSpec]]",
            "propertyType": "ColorRange",
            "propertyValue": "20",
            "required": false
        },
        {
            "propertyName": "[[TE.KPI.Operation]]",
            "propertyType": "Choice",
            "propertyValue": "Average",
            "required": true
        },
        {
            "propertyName": "[[TE.KPI.LargerBetter]]",
            "propertyType": "CheckBox",
            "propertyValue": false,
            "required": false
        },
        {
            "propertyName": "[[TE.KPI.SourceTiers]]",
            "propertyType": "Tier selector",
            "propertyValue": [
                "0937_Process_Data Connectivity",
                "0937_Process_E-mobility I",
                "0937_Process_E-mobility II",
                "0937_Process_Molding",
                "0937_Process_Plating",
                "0937_Process_Semiauto-A",
                "0937_Process_Semiauto-B",
                "0937_Process_Stamping"
            ],
            "required": false
        },
        {
            "propertyName": "[[TE.KPI.SourceKPI]]",
            "propertyType": "KPI selector",
            "propertyValue": [
                "Manual KPI Tier 4"
            ],
            "required": true
        }
    ]
};

let fields = CustomFields.fields;
let requiredFields = fields.filter((field) => field.required === true);
console.log(requiredFields);

//&&
//((field.propertyValue === '' || field.propertyValue === undefined) || (Array.isArray(field.propertyValue) && !field.propertyValue.length))