const inquirer = require('inquirer');
const mySQL = require('mysql2');
const cfonts = require('cfonts');

//connecting mysql
const connecting =  mySQL.createConnection({
    host: "localhost",
    // port: 3001,
    user: "root",
    password: "nilknarf",
    database: "employeeTracker_db",
});

connecting.connect((err) => {
    if (err) throw err;
    console.log('connected to database');
    begin();
})

cfonts.say('Employee|Manager', {
	font: 'block',              // define the font face
	align: 'left',              // define text alignment
	colors: ['gray'],         // define all colors
	background: 'transparent',  // define the background color, you can also use `backgroundColor` here as key
	letterSpacing: 1,           // define letter spacing
	lineHeight: 1,              // define the line height
	space: true,                // define if the output text should have empty lines on top and on the bottom
	maxLength: '0',             // define how many character can be on one line
	gradient: false,            // define your two gradient colors
	independentGradient: false, // define if you want to recalculate the gradient for each new line
	transitionGradient: false,  // define if this is a transition between colors directly
	env: 'node'                 // define the environment cfonts is being executed in
});

function begin() {
    inquirer
        .prompt({
            type: "list",
            name: "action",
            message: "What would you like to do?",
            choices: [
                "View all departments",
                "View all roles",
                "View all employees",
                "Add a department",
                "Add a role",
                "Add an employee",
                "Add a Manager",
                "Update an employee role",
                "View Employees by Manager",
                "View Employees by Department",
                "Delete Departments | Roles | Employees",
                "View the total utilized budget of a department",
                "Exit",
            ],
        }) .then((result) => {
            switch (result.action) {
                case "View all departments":
                    viewAllDepartments();
                    break;
                case "View all roles":
                    viewAllRoles();
                    break;
                case "View all employees":
                    viewAllEmployees();
                    break;
                case "Add a department":
                    addDepartment();
                    break;
                case "Add a role":
                    addRole();
                    break;
                case "Add an employee":
                    addEmployee();
                    break;
                case "Add a Manager":
                    addManager();
                    break;
                case "Update an employee role":
                    updateEmployeeRole();
                    break;
                case "View Employees by Manager":
                    viewEmployeesByManager();
                    break;
                case "View Employees by Department":
                    viewEmployeesByDepartment();
                    break;
                case "Delete Departments | Roles | Employees":
                    deleteDepartmentsRolesEmployees();
                    break;
                case "View the total utilized budget of a department":
                    viewTotalUtilizedBudgetOfDepartment();
                    break;
                case "Exit":
                    connecting.end();
                    console.log("Goodbye!");
                    break;
            }
        })
}

function viewAllDepartments() {
    const query = 'SELECT * FROM departments';
    connecting.query(query, (err, res) => {
        if (err) throw err;
        console.table(res);
        begin()
    })
}

function viewAllRoles() {
    const query = `
    SELECT roles.title, roles.id, departments.department_name, roles.salary 
    FROM roles 
    JOIN departments ON roles.department_id = departments.id`;

    connecting.query(query, (err, res) => {
        if (err) throw err;
        console.table(res);
        begin();
    });
}

function viewAllEmployees() {
    const query = ` SELECT e.id, e.first_name, e.last_name, r.title, d.department_name, r.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager_name
    FROM employee e
    LEFT JOIN roles r ON e.role_id = r.id
    LEFT JOIN departments d ON r.department_id = d.id
    LEFT JOIN employee m ON e.manager_id = m.id;`;

    connecting.query(query, (err, res) => {
        if (err) throw err;
        console.table(res);
        begin();
    })
}

function addDepartment() {
    inquirer
        .prompt({
            type: 'input',
            name: "name",
            message: 'Enter the new department name: ',
        }) .then((result) => {
            console.log(result.name);
            const query = `INSERT INTO departments (department_name) VALUES ("${result.name}")`;

            connecting.query(query, (err, res) => {
                if(err) throw err;
                console.log(`added the new department ${result.name} to the database`);
                begin();
                console.log(result.name);
            })
        })
}

function addRole() {
    const query = `SELECT * FROM departments`;
    connecting.query(query, (err, res) => {
        if(err) throw err;
        inquirer
            .prompt([
                {
                    type: "input",
                    name: "title",
                    message: "Enter the title of the new role:",
                },
                {
                    type: "input",
                    name: "salary",
                    message: "Enter the salary of the new role:",
                },
                {
                    type: "list",
                    name: "department",
                    message: "Select the department for the new role:",
                    choices: res.map(
                        (department) => department.department_name
                    ),
                },
            ]) .then((result) => {
                const department = res.find(
                    (department) => department.name === result.department
                );
                const query = `INSERT INTO roles SET ?`;
                connecting.query(query, 
                    {
                        title: result.title,
                        salary: result.salary,
                        department_id: department,
                    }, 
                    (err, res) => {
                        if(err) throw err;
                        console.log( `Added role ${result.title} with salary ${result.salary} to the ${result.department} department in the database!`
                        );
                        begin();
                    })
            })
    })
}

function addEmployee() {
    connecting.query(`SELECT id, title FROM roles`, (error, results) => {
        if(error) {
            console.error(error);
            return;
        }

        const roles = results.map(({ id, title }) => ({
            name: 'title',
            value: 'id',
        }));

        connecting.query(
            `SELECT id, CONCAT(first_name, ' ', last_name) AS name FROM employee`, (error, results) => {
                if(error) {
                    console.log(error);
                    return;
                }
        
                const managers = results.map(({ id, name }) => ({
                    name,
                    value: id,
                }));

                inquirer
                    .prompt([
                        {
                            type: "input",
                            name: "firstName",
                            message: "Enter the employee's first name:",
                        },
                        {
                            type: "input",
                            name: "lastName",
                            message: "Enter the employee's last name:",
                        },
                        {
                            type: "list",
                            name: "roleId",
                            message: "Select the employee role:",
                            choices: roles,
                        },
                        {
                            type: "list",
                            name: "managerId",
                            message: "Select the employee manager:",
                            choices: [
                                { name: "None", value: null },
                                ...managers,
                            ],
                        },
                    ]) .then((result) => {
                        const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)`;

                        const values = [
                            result.firstName,
                            result.lastName,
                            result.roleId,
                            result.managerId,
                        ];
                        connecting.query(sql, values, (error) => {
                            if(error) {
                                console.log(error);
                                return;
                            }

                            console.log('Employee added')
                            begin();
                        })
                    })
                    .catch((error) => {
                        console.long(error);
                    })
            }
        )
    })
}

function addManager() {
    const queryDepart = "SELECT * FROM departments";
    const queryEmpl = "SELECT * FROM employee";

    connecting.query(queryDepart, (err, resDepart) => {
        if (err) throw err;
        connecting.query(queryEmpl, (err, resEmpl) => {
            if (err) throw err;
            inquirer
                .prompt([
                    {
                        type: "list",
                        name: "department",
                        message: "Select the department:",
                        choices: resDepart.map(
                            (department) => department.department_name
                        ),
                    },
                    {
                        type: "list",
                        name: "employee",
                        message: "Select the employee to add a manager to:",
                        choices: resEmpl.map(
                            (employee) =>
                                `${employee.first_name} ${employee.last_name}`
                        ),
                    },
                    {
                        type: "list",
                        name: "manager",
                        message: "Select the employee's manager:",
                        choices: resEmpl.map(
                            (employee) =>
                                `${employee.first_name} ${employee.last_name}`
                        ),
                    },
                ])
                .then((result) => {
                    const department = resDepart.find(
                        (department) =>
                            department.department_name === result.department
                    );
                    const employee = resEmpl.find(
                        (employee) =>
                            `${employee.first_name} ${employee.last_name}` ===
                            result.employee
                    );
                    const manager = resEmpl.find(
                        (employee) =>
                            `${employee.first_name} ${employee.last_name}` ===
                            result.manager
                    );
                    const query =
                        "UPDATE employee SET manager_id = ? WHERE id = ? AND role_id IN (SELECT id FROM roles WHERE department_id = ?)";
                    connecting.query(query,
                        [manager.id, employee.id, department.id],
                        (err, res) => {
                            if (err) throw err;
                            console.log(
                                `Added manager ${manager.first_name} ${manager.last_name} to employee ${employee.first_name} ${employee.last_name} in department ${department.department_name}!`
                            );
                            begin();
                        }
                    );
                });
        });
    });
}

function updateEmployeeRole() {
    const queryEmpl = `SELECT employee.id, employee.first_name, employee.last_name, roles.title
    FROM employee
    LEFT JOIN roles On employess.role_id = roles.id`;

    const queryRoles = `SELECT * FROM roles`;
    connecting.query(queryEmpl, (err, resEmpl) => {
        if(err) throw err;
        connecting.query(queryRoles, (err, resRoles) => {
            if(err) throw err;
            inquirer
                .prompt([
                    {
                        type: "list",
                        name: "employee",
                        message: "Select the employee to update:",
                        choices: resEmpl.map(
                            (employee) =>
                                `${employee.first_name} ${employee.last_name}`
                        ),
                    },
                    {
                        type: "list",
                        name: "role",
                        message: "Select the new role:",
                        choices: resRoles.map((role) => role.title),
                    },
                ]) .then((result) => {
                    const employee = resEmpl.find(
                        (employee) => `${employee.first_name} ${employee.last_name}` === result.employee
                    );

                    const role = resRoles.find(
                        (role) => role.title === result.title
                    );

                    const query = `UPDATE employess SET role_id = ? WHERE id = ?`;
                    connecting.query(
                        query,
                        [role.id, employee.id],
                        (err, res) => {
                            if(err) throw err;
                            console.log(`Updated ${employee.first_name} ${employee.last_name}'s role to ${role.title}.`);

                            begin();
                        }
                    )

                })
        })
    })
}

function viewEmployeesByManager() {
    const query = `
    SELECT 
    e.id, 
    e.first_name, 
    e.last_name, 
    r.title, 
    d.department_name, 
    CONCAT(m.first_name, ' ', m.last_name) AS manager_name
  FROM 
    employee e
    INNER JOIN roles r ON e.role_id = r.id
    INNER JOIN departments d ON r.department_id = d.id
    LEFT JOIN employee m ON e.manager_id = m.id
  ORDER BY 
    manager_name, 
    e.last_name, 
    e.first_name
    `;

    connecting.query(query, (err, res) => {
        if(err) throw err;

        const employeeManager = res.reduce((acc, cur) => {
            const managerName = cur.manager_name;
            if(acc[namagerName]) {
                acc[managerName].push(cur);
            } else {
                acc[managerName] = [cur];
            }
            return acc;
        }, {});

        console.log('Employees by manager: ');
        for(const managerName in employeeManager) {
            console.log(`\n${managerName}:`);
            const employees = employeeManager[managerName];
            employees.forEach((employee) => {
                console.log(`${employee.first_name} ${employee.last_name} | ${employee.title} | ${employee.department_name}`)
            })
        }
        begin();
    })
}

function viewEmployeesByDepartment() {
    const query = `SELECT departments.department_name, employee.first_name, employee.last_name
    FROM employee 
    INNER JOIN roles ON employee.role_id = roles.id 
    INNER JOIN departments ON roles.department_id = departments.id 
    ORDER BY departments.department_name ASC`;

    connecting.query(query, (err, res) => {
        if(err) throw err;
        console.log('\nEmployees by Department: ');
        console.table(res);
        begin();
    })
}

function deleteDepartmentsRolesEmployees() {
    inquirer
        .prompt({
            type: "list",
            name: "data",
            message: "What would you like to delete?",
            choices: ["Employee", "Role", "Department"],
        })
        .then((result) => {
            switch (result.data) {
                case "Employee":
                    deleteEmployee();
                    break;
                case "Role":
                    deleteRole();
                    break;
                case "Department":
                    deleteDepartment();
                    break;
                default:
                    console.log(`Invalid data: ${result.data}`);
                    begin();
                    break;
            }
        })
}

function deleteEmployee() {
    const query = "SELECT * FROM employee";
    connecting.query(query, (err, res) => {
        if(err) throw err;
        const employeeList = res.map((employee) => ({
            name: `${employee.first_name} ${employee.last_name}`,
            value: employee.id,
        }));

        employeeList.push({ name: 'Return', value: 'back'});
        inquirer
            .prompt({
                type: "list",
                name: "id",
                message: "Select the employee you want to delete:",
                choices: employeeList,
            }) .then((result) => {
                if(result.id === 'back') {
                    deleteDepartmentsRolesEmployees();
                    return;
                }
                const query = `DELETE FROM employess WHERE id = ?`;
                connecting.query(query, (err, res) => {
                    if(err) throw err;
                    console.log(`Deleted employee with ID ${answer.id}`);
                    begin();
                })
            })
    })
}

function deleteRole() {
    const query = `SELECT * FROM roles`;
    connecting.query(query, (err, res) => {
        if(err) throw err;
        const choices = res.map((role) => ({
            name: `${role.title} (${role.id}) - ${role.salary}`,
            value: role.id,
        }))

        choices.push({ name: 'Return', value: 'null' });
        inquirer
            .prompt({
                type: "list",
                name: "roleId",
                message: "Select the role you want to delete:",
                choices: choices,
            }) .then((result) => {
                if(result.roleId === null) {
                    deleteDepartmentsRolesEmployees();
                    return;
                }
                const query = `DELETE FROM roles WHERE id = ?`;
                connecting.query(query, (err, res) => {
                    if(err) throw err;
                    console.log(`Deleted role of ${result.roleId}`);
                    begin();
                })
            })
    })
}

function deleteDepartment() {
    const query = `SELECT * FROM departments`;
    connecting.query(query, (err, res) => {
        if(err) throw err;
        const departmentChoice = res.map((department) => ({
            name: department.department_name,
            value: department.id,
        }))

        inquirer
            .prompt({
                type: "list",
                name: "departmentId",
                message: "Which department do you want to delete?",
                choices: [
                    ...departmentChoice,
                    { name: "Return", value: "back" },
                ],
            }) .then((result) => {
                if(result.departmentId === 'back') {
                    deleteDepartmentsRolesEmployees();
                } else {
                    const query = `DELETE FROM departments WHERE id = ?`;
                    connecting.query(query, [result.departmentId], (err, res) => {
                        if(err) throw err;
                        console.log(`Deleted department of ${result.departmentId}`);
                        begin();
                    })
                }
            })
    })
}

function viewTotalUtilizedBudgetOfDepartment() {
    const query = `SELECT * FROM departments`;
    connecting.query(query, (err, res) => {
        if(err) throw err;
        const departmentChoice = res.map((department) = ({
            name: department.department_name,
            value: department.id,
        }))

        inquirer
            .prompt({
                type: "list",
                name: "departmentId",
                message:
                    "Which department do you want to calculate the total salary for?",
                choices: departmentChoice,
            }) .then((result) => {
                const query = `
                    SELECT 
                    departments.department_name AS department,
                    SUM(roles.salary) AS total_salary
                    FROM departments
                    INNER JOIN roles ON departments.id = roles.department_id
                    INNER JOIN employee ON roles.id = employee.role_id
                    WHERE 
                    departments.id = ?
                    GROUP BY 
                    departments.id
                `;

                connecting.query(query, [result.departmentId], (err, res) => {
                   if(err) throw err;
                   const totalSalary = res[0].totalSalary;
                   console.log(`The total salary for employees in this department is $${totalSalary}`);
                   begin();
                })
            })
    })
}

process.on('exit', () => {
    connecting.end();
})