window.App = Ember.Application.create({
  rootElement: '#app'
});

App.ApplicationAdapter = DS.FixtureAdapter.extend({
  simulateRemoteResponse: false
});

App.Employee = DS.Model.extend({
  name: DS.attr("string"),
  salary: DS.attr("number")
});

App.Employee.FIXTURES = [{
  id: 1,
  name: "Jane Q. Public",
  salary: 80000
}, {
  id: 2,
  name: "John Q. Public",
  salary: 60000
}];

// ----- ROUTES

App.Router.map(function() {
  this.resource("employees", function() {
    this.route("employee", {path: ":employee_id"});
  });
});

App.IndexRoute = Ember.Route.extend({
  redirect: function() {
    this.transitionTo('employees');
  }
});

App.EmployeesRoute = Ember.Route.extend({
  model: function (params) {
    return this.store.find('employee');
  }
});

App.EmployeesIndexRoute = Ember.Route.extend({
  model: function (params) {
    return this.modelFor('employees');
  }
});

// ----- CONTROLLERS

App.EmployeesEmployeeController = Ember.ObjectController.extend({
  actions: {
    giveRaise: function() {
      this.set("salary", this.get("salary") * 1.1);
    }
  }
});

// ----- MOCHA STUFF

mocha.setup("bdd");
chai.should();

var server;

Ember.Test.adapter = Ember.Test.MochaAdapter.create();

var testing = function() {
  var helper = {
    container: function() {
      return App.__container__;
    },
    controller: function( name ) {
      return helper.container().lookup('controller:' + name);
    },
    currentPath: function() {
      return helper.controller('application').get('currentPath');
    }
  };
  return helper;
};

Ember.Test.registerHelper('currentPath', function() {
  return testing().currentPath();
});

App.rootElement = '#mocha-fixture';
App.setupForTesting();
App.injectTestHelpers();

// Run before each test case.
beforeEach(function() {
  Ember.run(App, 'reset');
  Ember.testing = true;
});

// Run after each test case.
afterEach(function() {
    Ember.testing = false;
});

// Clean up after our last test so you can try out the app
after(function() {
  Ember.run(App, 'reset');
});

// ----- TESTS

describe("Model", function() {
  describe("App.Employee", function() {
    var store;

    beforeEach(function() {
      store = App.__container__.lookup('store:main');
    });

    it("has a name", function() {
      var jane;
      Ember.run(function() {
        jane = store.find('employee', 1);
      });
      jane.get("name").should.equal("Jane Q. Public");
    });
  });
});

describe("Controller", function() {
  describe("App.EmployeesEmployeeController", function() {
    var model, controller;

    beforeEach(function() {
      var container = App.__container__;
      var store = container.lookup('store:main');
      controller = container.lookup('controller:employeesEmployee');

      Ember.run(function() {
        model = store.createRecord('employee', { salary: 100000 });
        controller = controller.set('model', model);
      });
    });

    it("can give the employee a raise", function() {
      var oldSalary = model.get("salary");
      Ember.run(function() {
        controller.send('giveRaise');
      });
      model.get("salary").should.equal(oldSalary * 1.1);
    });
  });
});

describe("Integration", function() {
  describe("App", function() {
    it("lets you give Jane Q. Public a raise", function() {
      visit('/')
        .then(function() {
          currentPath().should.equal('employees.index');
          find('h1:contains("Testing Ember.js with Mocha")').should.exist;
          find('li').length.should.equal(2);
        })
        .click('a:contains("Jane Q. Public")')
        .then(function() {
          find('.salary').eq(0).text().should.equal("$80000");
        })
        .click('button:contains("Give Raise")')
        .then(function() {
          find('.salary').eq(0).text().should.equal("$88000");
        });
    });

    it("lets you give John Q. Public a raise", function() {
      visit('/')
        .then(function() {
          currentPath().should.equal('employees.index');
          find('h1:contains("Testing Ember.js with Mocha")').should.exist;
          find('li').length.should.equal(2);
        })
        .click('a:contains("John Q. Public")')
        .then(function() {
          find('.salary').eq(0).text().should.equal("$60000");
        })
        .click('button:contains("Give Raise")')
        .then(function() {
          find('.salary').eq(0).text().should.equal("$66000");
        });
    });
  });
});

mocha.run();






