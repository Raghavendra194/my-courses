let array = ['Raghu', 'Ravi', 'Raju'];
let copiedArray = [...array];
array.push('Sanju');
array.push('Sanju3');
//console.log(copiedArray); // Output: ["Raghu", "Ravi",


let obj = {
    name: 'Raghu',
    age: 20,
    getDetail() {
        return `Person name is ${this.name} and age is ${this.age}`
    }
}

// spread operators
let copedObject = { ...obj };
obj.lastName = 'HR';
//console.log(copedObject);

// rest operators
const toArray = (...args) => {
    return args
}

//console.log(toArray(1, 2, 3, 4));

let propertyValue = 20;
let counter = !Array.isArray(propertyValue) ? propertyValue : 0;



const fetchData = () => {
    const promise = new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve('done !');
        }, 1500)

    })
    return promise;
}
const fetchData2 = () => {
    const promise = new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve('done fetchData2!');
        }, 1500)

    })
    return promise;
}

fetchData().then(text => {
    console.log(text);
    return fetchData2();
}).then(text2 => {
    console.log(text2);
});




