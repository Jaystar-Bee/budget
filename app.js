var budgetController = (function() {

    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;

    };

    Expense.prototype.calcPercentage = function (totalIncome) {

        if (totalIncome > 0) {
            this.percentage = Math.round((this.value/totalIncome)* 100);
        } else {
            this.percentage = -1;
        }

    }

    Expense.prototype.getPercent = function () {
        return this.percentage;
    }

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;

    };
    var calculateTotal = function(type) {
        sum = 0;
        data.allItems[type].forEach(function(current) {
            sum += current.value; 
        });
        data.total[type] = sum;
    }

    var data = {
        allItems: {
            exp : [],
            inc : []
        },
        total : {
            exp : 0,
            inc : 0
        },
        budget : 0,
        percentage : -1
        
    };

    return {

        // add an item 
        addItem: function(type, des, val) {
            var newItem, ID;

            // last ID obtained and then create a new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length -1].id + 1;
            }else {
                ID = 0;
            }
            // Create new Item based on inc and exp
            if (type === 'exp') {
                newItem = new Expense (ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income (ID, des, val);
            }
            //Push into the data structure 
            data.allItems[type].push(newItem);

            //return the item generated
            return newItem;
          },
          calculateBudget : function() {
              // Calculate the total expense and the income
              calculateTotal('inc');
              calculateTotal('exp');

              // Calculate the total income : income - expenses
              data.budget = data.total.inc - data.total.exp;

              // Calculate the percentage of the income we spent

              if (data.total.inc > 0) {
                data.percentage = Math.round((data.total.exp/data.total.inc) * 100);
              } else {
                  data.percentage = -1;
              }
              
          },

          calculatePercentage: function () {
        
            data.allItems.exp.forEach(function(cur) {
                cur.calcPercentage(data.total.inc);
            });

          },

          getPercentage: function() {
            var calPer = data.allItems.exp.map(function(cur) {
                return cur.getPercent();
            });
            return calPer;
          },
          getBudget: function() {
              return {
                totalBudget: data.budget,
                totalInc: data.total.inc,
                totalExp: data.total.exp,
                totalPercentage : data.percentage

              }
          },


          deleteItem: function(type, id) {
            var ids, index;

            //ids = [1,2,4,5]

            ids = data.allItems[type].map(function(current) {
                return current.id;
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }

          },
          testing : function () {
              return data;
          }


    }

    

})();


var UIcontroller = (function() {

        var DOMselector = {
            inputType : '.add__type',
            inputDescription : '.add__description',
            inputValue : '.add__value',
            inputBtn : '.add__btn',
            incomeContainer : '.income__list',
            expensesContainer : '.expenses__list',
            budgetLabel: '.budget__value',
            incomeLabel: '.budget__income--value',
            expensesLabel: '.budget__expenses--value',
            percentageLabel: '.budget__expenses--percentage',
            container: '.container',
            percentLabel: '.item__percentage',
            dateLabel: '.budget__title--month'

        };

        var testformating = function(num, type) {
            var subNum, int, dec;
            num = Math.abs(num);
            num = num.toFixed(2);

            subNum = num.split('.');

            int = subNum[0];
            dec = subNum[1];

            if (int.length > 3) {
                int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);  
            }

            return (type === 'exp'? '-' : '+') + ' ' + int + '.' + dec;


        };
         var nodeListForEach = function(list, callback) {
            for (var i = 0; i < list.length; i++) {
                callback(list[i], i)
            }
        }


    return  {
        getInput: function() {
            return {
                type : document.querySelector(DOMselector.inputType).value, // type = inc or exp
                description : document.querySelector(DOMselector.inputDescription).value,
                value : parseFloat(document.querySelector(DOMselector.inputValue).value)
            };
        },
        
        addListItem : function(obj, type) {
            var html, newHtml;
            // Create HTML strings with placeholder text

            if (type === 'inc') {
                element = DOMselector.incomeContainer;
                
                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMselector.expensesContainer;

                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // Replce the plceholder with actual data
            newHtml = html.replace ('%id%', obj.id);
            newHtml = newHtml.replace ('%description%', obj.description);
            newHtml = newHtml.replace('%value%', testformating(obj.value, type));

            //Insert the HTML into DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        clearFields: function () {
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMselector.inputDescription + ', ' + DOMselector.inputValue);

            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function(item, index, array) {
                item.value = ''; 
            });
            fieldsArr[0].focus();


        },
        displayBudget: function(obj) {
            var type;
            obj.totalBudget > 0 ? type = 'inc' : type ='exp';

            document.querySelector(DOMselector.budgetLabel).textContent = testformating(obj.totalBudget, type);
           
            document.querySelector(DOMselector.incomeLabel).textContent = testformating(obj.totalInc, 'inc');

            document.querySelector(DOMselector.expensesLabel).textContent = testformating(obj.totalExp, 'exp');

            if (obj.totalPercentage > 0) {
            document.querySelector(DOMselector.percentageLabel).textContent = obj.totalPercentage + '%';
            } else {
                document.querySelector(DOMselector.percentageLabel).textContent = '---';
            }
        },

        displayPercentage: function (percents) {

            var fields, nodeListForEach;

            fields = document.querySelectorAll(DOMselector.percentLabel);

            nodeListForEach(fields, function (current, index) {
                current.textContent = percents[index] + '%';

            });
        },
        displayDate: function() {
            var currentDate, month, year;

            currentDate = new Date();

            year = currentDate.getFullYear();
            month = currentDate.getMonth();
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

            document.querySelector(DOMselector.dateLabel).textContent = months[month] + ', ' + year;
        },
        changeTheme: function () {
            var fields = document.querySelectorAll(DOMselector.inputType + ',' + DOMselector.inputDescription + ',' + DOMselector.inputValue);

            nodeListForEach(fields, function(current) {
                current.classList.toggle('red-focus');

            });
            document.querySelector(DOMselector.inputBtn).classList.toggle('red');
            
        },
        removeItem: function (currentID) {
            var element;
            element = document.getElementById(currentID);

            element.parentNode.removeChild(element);

        },

        getDOMselector: function () {
            return DOMselector;
        }

    };

})();



var controller =  (function(budgetctrl, UIctrl) {
    var DOM = UIctrl.getDOMselector();
    var getEventListeners = function () {

        
        document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem);

        document.addEventListener('keypress', function(event) {
    
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
    
        });
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UIctrl.changeTheme);
    } 

    var budgetUpdate = function() {

        //1. Calculate the budget
        budgetctrl.calculateBudget()

        //2. Return the budget
        var budget = budgetctrl.getBudget();
        //3. Display/Update the budget on UI
        UIctrl.displayBudget(budget);
    }


    var itemPercentage = function () {
        // Calculate the percentage
        budgetctrl.calculatePercentage();
        //return the percentages
        var percent = budgetctrl.getPercentage();
        //display the percentage
        UIctrl.displayPercentage(percent);
    }

    var ctrlAddItem =  function() {
        var input, newItem1, addItem, clearInput;
        //1. Get the user values
        input = UIctrl.getInput();

        if (input.description !== '' && input.value > 0 && !isNaN(input.value)) {
             //2. Add the item to the budget controller
        newItem1 = budgetctrl.addItem(input.type, input.description, input.value);

        //3. Add the item to the UI controller
        addItem = UIctrl.addListItem(newItem1, input.type);

        //4. Clear the input fields
        clearInput = UIctrl.clearFields();

        //5. Calculate and Update Budget
        budgetUpdate();

        var test = budgetctrl.testing();

        //6. Calculate the percentages
        itemPercentage();

        };
       
    };

    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID; 

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]); 

            //1. Delete item from the data structure
            budgetctrl.deleteItem(type, ID);
            //2. Delete item from the UI

            UIctrl.removeItem(itemID);

            //3. Calculate the budget.
            budgetUpdate();

            //4. Calculate the percentages
            itemPercentage();
        }
    }

    return {
        init : function (){
            console.log('Application has Started!!');
            UIctrl.displayDate();
            UIctrl.displayBudget({
                totalBudget: 0,
                totalInc: 0,
                totalExp: 0,
                totalPercentage : -1
            });
            getEventListeners();
        }
    };

})(budgetController, UIcontroller);

controller.init();