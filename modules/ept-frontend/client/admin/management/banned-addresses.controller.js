var ctrl = ['$rootScope', '$scope', '$location', '$timeout', '$anchorScroll', 'Session', 'Alert', 'Bans', 'bannedAddresses', function($rootScope, $scope, $location, $timeout, $anchorScroll, Session, Alert, Bans, bannedAddresses) {
  var ctrl = this;
  this.parent = $scope.$parent.AdminManagementCtrl;
  this.parent.tab = 'bannedAddresses';

  this.showBanAddresses = false;
  this.searchStr = bannedAddresses.search;
  this.addressesToBan = [{}];

  this.ipRegex = /(^\s*((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))\s*$)/;

  this.hostnameRegex = /(^\s*((?=.{1,255}$)[0-9A-Za-z\*](?:(?:[0-9A-Za-z\*]|\b-){0,61}[0-9A-Za-z\*])?(?:\.[0-9A-Za-z\*](?:(?:[0-9A-Za-z\*]|\b-){0,61}[0-9A-Za-z\*])?)*\.?)\s*$)/;

  // Models backing pagination of addresses
  this.search = bannedAddresses.search;
  this.page = bannedAddresses.page;
  this.limit = bannedAddresses.limit;
  this.field = bannedAddresses.field;
  this.desc = bannedAddresses.desc;
  this.next = bannedAddresses.next;
  this.prev = bannedAddresses.prev;
  this.addresses = bannedAddresses.data;

  this.setSortField = function(sortField) {
    // Sort Field hasn't changed just toggle desc
    var unchanged = sortField === ctrl.field || (sortField === 'created_at' && !ctrl.field);
    if (unchanged) { ctrl.desc = ctrl.desc.toString() === 'true' ? 'false' : 'true'; } // bool to str
    // Sort Field changed default to ascending order
    else { ctrl.desc = 'false'; }
    ctrl.field = sortField;
    ctrl.page = 1;
    $location.search('page', ctrl.page);
    $location.search('desc', ctrl.desc);
    $location.search('field', sortField);
  };

  this.getSortClass = function(sortField) {
    var sortClass;
    var desc = ctrl.desc.toString() === 'true'; // str to bool
    if (sortField === 'created_at' && !ctrl.field && desc) {
      sortClass = 'fa fa-sort-desc';
    }
    else if (ctrl.field === sortField && desc) {
      sortClass = 'fa fa-sort-desc';
    }
    else if (ctrl.field === sortField && !desc) {
      sortClass = 'fa fa-sort-asc';
    }
    else { sortClass = 'fa fa-sort'; }
    return sortClass;
  };

  this.searchAddresses = function() {
    if (!ctrl.searchStr || !ctrl.searchStr.length) {
      ctrl.clearSearch();
      return;
    }
    $location.search({
      search: ctrl.searchStr || undefined,
      page: undefined
    });
  };

  this.clearSearch = function() {
    $location.search('search', undefined);
    ctrl.searchStr = null;
  };

  this.showEditAddress = false;
  this.selectedAddress = null;
  this.editAddressBtnLabel = 'Edit Address';
  this.editAddressSubmitted = false;

  this.showEditAddressModal = function(addrInfo) {
    ctrl.selectedAddress = angular.copy(addrInfo);
    ctrl.showEditAddress = true;
  };

  this.closeEditAddress = function() {
    ctrl.showEditAddress = false;
    ctrl.selectedAddress = null;
  };

  this.editAddress = function() {
    ctrl.editAddressSubmitted = true;
    ctrl.editAddressBtnLabel = 'Loading...';
    var address = ctrl.selectedAddress.hostname || ctrl.selectedAddress.ip;
    ctrl.selectedAddress.hostname = ctrl.selectedAddress.hostname ? ctrl.selectedAddress.hostname.replace(new RegExp('\\*', 'g'), '%') : undefined;
    Bans.editAddress(ctrl.selectedAddress).$promise
    .then(function() {
      Alert.success('Sucessfully edited address ' + address);
      ctrl.pullPage();
    })
    .catch(function() {
      Alert.error('There was an error editing the address info for ' + address);
    })
    .finally(function() {
      ctrl.closeEditAddress();
      $timeout(function() {
        ctrl.editAddressBtnLabel = 'Edit Address';
        ctrl.editAddressSubmitted = false;
        ctrl.selectedAddress = null;
      }, 500);
    });
  };

  this.showConfirmDeleteAddress = false;
  this.deleteAddressBtnLabel = 'Confirm Delete';
  this.deleteAddressSubmitted = false;

  this.showConfirmDeleteAddressModal = function(addrInfo) {
    ctrl.selectedAddress = angular.copy(addrInfo);
    ctrl.showConfirmDeleteAddress = true;
  };

  this.closeConfirmDeleteAddress = function() {
    ctrl.showConfirmDeleteAddress = false;
    ctrl.selectedAddress = null;
  };

  this.deleteAddress = function() {
    ctrl.deleteAddressSubmitted = true;
    ctrl.deleteAddressBtnLabel = 'Loading...';

    var address = ctrl.selectedAddress.hostname || ctrl.selectedAddress.ip;
    var params = {
      hostname: ctrl.selectedAddress.hostname ? ctrl.selectedAddress.hostname.replace(new RegExp('\\*', 'g'), '%') : undefined,
      ip: ctrl.selectedAddress.ip
    };
    Bans.deleteAddress(params).$promise
    .then(function() {
      Alert.success('Sucessfully deleted address ' + address);
      ctrl.pullPage();
    })
    .catch(function() {
      Alert.error('There was an error deleting the address ' + address);
    })
    .finally(function() {
      ctrl.closeConfirmDeleteAddress();
      $timeout(function() {
        ctrl.deleteAddressBtnLabel = 'Confirm Delete';
        ctrl.deleteAddressSubmitted = false;
        ctrl.selectedAddress = null;
      }, 500);
    });
  };

  this.banAddressesBtnLabel = 'Ban Addresses';
  this.banAddressesSubmitted = false;

  this.closeBanAddresses = function() {
    ctrl.showBanAddresses = false;
    ctrl.addressesToBan = [{ typeIp: true, decay:true, weight: 50 }];
  };

  this.checkAddresses = function() {
    return !ctrl.addressesToBan.filter(function(addr) {
      if ((addr.ip || addr.hostname) && addr.weight) { return addr; }
    }).length;
  };

  this.banAddresses = function() {
    ctrl.banAddressesBtnLabel = 'Loading...';
    ctrl.banAddressesSubmitted = true;

    var addresses = ctrl.addressesToBan.filter(function(addr) {
      if ((addr.ip || addr.hostname) && addr.weight) {
        // replace * wildcard with % db wildcard
        addr.hostname = addr.hostname ? addr.hostname.replace(new RegExp('\\*', 'g'), '%') : undefined;
        return addr;
      }
    });

    if (addresses.length) {
      Bans.addAddresses(addresses).$promise
      .then(function() {
        Alert.success('Sucessfully banned addresses');
        ctrl.pullPage();
      })
      .catch(function() {
        Alert.error('There was an error banning addresses');
      })
      .finally(function() {
        ctrl.closeBanAddresses();
        $timeout(function() { // wait for modal to close
          ctrl.banAddressesBtnLabel = 'Ban Addresses';
          ctrl.banAddressesSubmitted = false;
        }, 500);
      });
    }
  };

  $timeout($anchorScroll);

  this.offLCS = $rootScope.$on('$locationChangeSuccess', function() {
    var params = $location.search();
    var page = Number(params.page) || 1;
    var limit = Number(params.limit) || 25;
    var field = params.field;
    var descending = params.desc === 'true' || params.desc === undefined;
    var search = params.search;

    var pageChanged = false;
    var limitChanged = false;
    var fieldChanged = false;
    var descChanged = false;
    var searchChanged = false;

    if ((page === undefined || page) && page !== ctrl.page) {
      pageChanged = true;
      ctrl.page = page;
    }
    if ((limit === undefined || limit) && limit !== ctrl.limit) {
      limitChanged = true;
      ctrl.limit = limit;
    }
    if ((field === undefined || field) && field !== ctrl.field) {
      fieldChanged = true;
      ctrl.field = field;
    }
    if (descending !== ctrl.desc) {
      descChanged = true;
      ctrl.desc = descending.toString();
    }
    if ((search === undefined || search) && search !== ctrl.search) {
      searchChanged = true;
      ctrl.search = search;
    }
    if(pageChanged || limitChanged || fieldChanged || descChanged || searchChanged) { ctrl.pullPage(); }
  });

  $scope.$on('$destroy', function() { ctrl.offLCS(); });

  this.pullPage = function() {
    var query = {
      page: ctrl.page,
      limit: ctrl.limit,
      desc: ctrl.desc,
      field: ctrl.field,
      search: ctrl.search
    };

    // replace current users with new users
    Bans.pageBannedAddresses(query).$promise
    .then(function(updatedAddresses) {
      ctrl.addresses = updatedAddresses.data;
      ctrl.page = updatedAddresses.page;
      ctrl.limit = updatedAddresses.limit;
      ctrl.field = updatedAddresses.field;
      ctrl.desc = updatedAddresses.desc;
      ctrl.next = updatedAddresses.next;
      ctrl.prev = updatedAddresses.prev;
      ctrl.search = updatedAddresses.search;
      $timeout($anchorScroll);
    });
  };
}];

module.exports = angular.module('ept.admin.management.bannedAddresses.ctrl', [])
.controller('BannedAddressesCtrl', ctrl);
