var Validator = function() {};

// validate function will take value and a list of validators as argument
// then check the value for each of the validator in the list and return true or false accordingly
Validator.validate = function(value, rules) {
    var self = this;
    return rules.every(function(rule) {
        return self[rule](value);
    });
};

// validator to check if a value is a string
Validator.isString = function(value) {
    if (typeof value === 'string') {
        return true;
    }
    return false;
};

// validator to check if the password is valid
Validator.isPassword = function(value) {
    if (value.length>=8  &&  value.search(/[a-z]/)!=-1  &&  value.search(/[A-Z]/)!=-1  &&  value.search(/[0-9]/)!=-1  &&  value.search(/[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/)!=-1) {
        return true;
    }
    return false;
};
// validator to check if a value is not empty
Validator.isNotEmpty = function(value) {
    if (value !== '' && value !== null && typeof value !== 'undefined') {
        return true;
    }
    return false;
};

// validator to check if a value is a number
Validator.isNum = function(value) {
    if (!isNaN(value)  &&  !isNaN(parseFloat(value))) {
        return true;
    }
    return false;
};

// validator to check if the age is valid
Validator.isValidAge = function(value) {
    console.log("called "+ typeof(typeof (1*"dd")))
    if (Validator.validate(value, ["isNum"])  &&  (1*value) > 0  &&  (1*value) <= 100) {
        return true;
    }
    return false;
};

// validator to check if the email is valid
Validator.isEmail = function(value) {
    if (typeof value === 'string'  &&  value.match( /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/)) {
        return true;
    }
    return false;
};



let UserSchema = {
    model: {
        data: {
            userName: {
                type: "String",
                validator: ["isString"],
                required: "true",
            },
            password: {
                type: "String",
                validator: ["isPassword"],
                required: "true",    
            },
            email: {
                type: "String",
                  validator: ["isEmail"],
                required: "true",
            },
            age: {
                type: "Number",
                  validator: ["isValidAge"],
                required: "true",
            },
            country: {
                type: "string",
                required: "true",
                enum: ["India", "USA", "Canada", "Rome", "Singapore"],
            },
            submit: {
                type: "Number",
            }
        },
        queries: {},
        filters: {
            Register: ["userName", "password", "email", "age", "country", "submit"],
            Login: ["email", "password"],
        },
    },
    allowedViews: {
        Register: { type: "Form", name: "Register User" },
        Login: { type: "Form", name: "login User" },
    },
    views: {
        Register: {
            userName: {
                placeholder: "Enter Your UserName",
            },
            password: {
                placeholder: "Enter Your Password",
            },
            email: { placeholder: "Enter Your Email",},
            age: { placeholder: "Enter Your Age",},
            submit: { type: "submit" }
        },
        Login: {
            password: {
                placeholder: "Enter Your Password",
            },
            email: { placeholder: "Enter Your Email",},
        },
    },
};

// validate_form is called on onsubmit event
// validates all the fields of the form and gives an alert when validation fails 
const validate_form = (e) => {
    for(var i of e)
    {
        if(UserSchema.model.data[`${i.name}`].validator)
        {
            if(!Validator.validate(  e[i.name].value, UserSchema.model.data[`${i.name}`].validator ))
            {
                alert("Invalid "+i.name);
                return false
            }
        }
    }
    return true;
}

// createHtmlView takes json as input and returns html form as a string
const createHtmlView = (json) => {
    html = "<";
    html += `${json.tagname} `;
    if (json.attributes)
        for (attr in json.attributes) {
            if (attr != "content")
                html = html + ` ${attr}="${json.attributes[attr]}" `;
        }
    html += ">\n";
    if (json.attributes.content) {
        html += `${json.attributes.content}\n`;
    }
    if (json.children) {
        for (const child of json.children) {
            html += createHtmlView(child);
        }
    }
    if (json.tagname !== "input") html += `</${json.tagname}>\n`;
    return html;
};

//  returns the respective form input type 
const type_of = (type) => {
    type = type.toLowerCase();
    if (type === "string") return "text";
    else if (type === "number") return "number";
    else if (type === "boolean") return "checkbox";
    else return type;
};

// createView functions creates and returns the json format of from from userschema
const createView = (UserSchema, allowedViews, filter, view) => {
    let json = {
        tagname: "",
        attributes: {},
        children: [],
    };

    json.attributes.onsubmit="return validate_form(this)"
    json.tagname = "input";
    json.tagname = allowedViews.type;
    for (j in allowedViews) {
        json.attributes[`${j}`] = allowedViews[`${j}`];
    }
    delete json.attributes.type;

    for (const i of filter) {
        child = {
            tagname: "",
            attributes: {},
            // children: [],
        };
        child.tagname = "input";
        if(view[`${i}`])
        child.attributes = view[`${i}`];
        child.attributes.name = i;
        if (!child.attributes.type && UserSchema.model.data[`${i}`].type) {
            child.attributes.type = type_of(UserSchema.model.data[`${i}`].type);
        } else if (
            child.attributes.type == "textarea" ||
            child.attributes.type == "label"
        ) {
            child.tagname = child.attributes.type;
            delete child.attributes.type;
        } else if (child.attributes.type == "button") {
            child.tagname = "button";
            delete child.attributes.type;
        }

        if (UserSchema.model.data[`${i}`].required === "true") {
            child.attributes.required = "true";
        }
        if (UserSchema.model.data[`${i}`].enum) {
            child.tagname = "select";
            child.children = [];
            for (let j in UserSchema.model.data[`${i}`].enum) {
                let option = {
                    tagname: "",
                    attributes: {},
                };
                option.tagname = "option";
                option.attributes.value = UserSchema.model.data[`${i}`].enum[`${j}`];
                option.attributes.content = UserSchema.model.data[`${i}`].enum[`${j}`];
                child.children.push(option);
            }
        }
        json.children.push(child);
    }
    return json;
};


// modelToView calls createView and createHtmlView for each of the allowedViews in userschema
// prints the json and html of the form to the screen
modelToView = (UserSchema) => {
    document.querySelector(".abc").innerHTML = "";
    document.querySelector("#html_output").value = "";

    
    for (i in UserSchema.allowedViews) {
        let json = {};
        json = createView(
            UserSchema,
            UserSchema.allowedViews[`${i}`],
            UserSchema.model.filters[`${i}`],
            UserSchema.views[`${i}`]
        );


        // printing the value to the screen
        document.querySelector(".abc").innerHTML +=JSON.stringify(json, null, 2);
        document.querySelector(".abc").innerHTML += "\n\n";
        document.querySelector("#html_output").value += createHtmlView(json);
        document.querySelector("#html_output").value += "\n\n";
        
    }
};

// gives a default UserSchema value to the user  
document.querySelector("#model_input").innerHTML = JSON.stringify(UserSchema, null, 2);

// calling modelToView for the default value of UserSchema
modelToView(UserSchema);

// submitk function is called whenever user makes any change to the UserSchema and Submit it 
const submitk = () => {
    UserSchema = JSON.parse(document.querySelector("#model_input").value);
    modelToView(UserSchema);
};
