/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';
/**
 * Write your transction processor functions here
 */
var orderStatus = {
  Created: {code: 1, text: 'SaleAgreement Created'},
  Approved: {code: 2, text: 'SaleAgreement Approved'},
  Purchased: {code: 3, text: 'Land Purchased'},
  Completed: {code: 4, text: 'Notary Approved'},
};
/**
 * Sample transaction
 * @param {org.acme.titletransfer.CreateSaleAgreement} purchase
 * @transaction
 */
async function CreateSaleAgreement(purchase) {


  var saleAgreement = getFactory().newResource('org.acme.titletransfer', 'SaleAgreement', purchase.saleAgreementID);
  saleAgreement.propertyListing = purchase.propertyListing
  saleAgreement.buyer = purchase.buyer;
  saleAgreement.seller = purchase.propertyListing.seller;
  saleAgreement.created = new Date().toISOString();
  saleAgreement.status = JSON.stringify(orderStatus.Created);
  saleAgreement.approved = '';
  saleAgreement.completed = '';
  saleAgreement.purchased = '';


  return getAssetRegistry('org.acme.titletransfer.SaleAgreement')
    .then(function (assetRegistry) {
      var basicEvent = getFactory().newEvent('org.acme.titletransfer', 'orderPlaced');
      basicEvent.saleAgreementID = purchase.saleAgreementID;
      emit(basicEvent);
      return assetRegistry.add(saleAgreement);
    }).catch(function (error) {
      throw(error)
    });
}
/**
 * Sample transaction
 * @param {org.acme.titletransfer.createPropertyListing} purchase
 * @transaction
 */
async function createPropertyListing(purchase) {
  var propertyListing = getFactory().newResource('org.acme.titletransfer', 'PropertyListing', purchase.propertyListingID);
  propertyListing.MLS = purchase.MLS;
  propertyListing.seller = purchase.seller;
  propertyListing.amount = purchase.amount
  propertyListing.URL = purchase.URL;
  propertyListing.address = purchase.address;
  propertyListing.sqMeters = purchase.sqMeters;


  return getAssetRegistry('org.acme.titletransfer.PropertyListing')
    .then(function (assetRegistry) {
      return assetRegistry.add(propertyListing);
    }).catch(function (error) {
      throw(error)
    });
}
/**
 * Sample transaction
 * @param {org.acme.titletransfer.ApproveSaleAgreement} purchase
 * @transaction
 */
async function ApproveSaleAgreement(purchase) {
  if (purchase.saleAgreement.status === JSON.stringify(orderStatus.Created))
  {
    purchase.saleAgreement.approved = new Date().toISOString();
    purchase.saleAgreement.status = JSON.stringify(orderStatus.Approved);
    return getAssetRegistry('org.acme.titletransfer.SaleAgreement')
      .then(function (assetRegistry) {
        console.log(purchase);
        var basicEvent = getFactory().newEvent('org.acme.titletransfer', 'agreementApproved');
        basicEvent.saleAgreementID = purchase.saleAgreement.saleAgreementID;
        emit(basicEvent);
        return assetRegistry.update(purchase.saleAgreement);
      }).catch(function (error) {
        throw(error)
      });
  }
  else {
    throw('Sale Agreement should be in created status')
  }
}

/**
 * Sample transaction
 * @param {org.acme.titletransfer.Buy} purchase
 * @transaction
 */
async function Buy(purchase) {
  if  (purchase.saleAgreement.status === JSON.stringify(orderStatus.Approved))
  {
    purchase.saleAgreement.purchased = new Date().toISOString();
    purchase.saleAgreement.status = JSON.stringify(orderStatus.Purchased);


    return getAssetRegistry('org.acme.titletransfer.SaleAgreement')
      .then(function (assetRegistry) {
        var basicEvent = getFactory().newEvent('org.acme.titletransfer', 'orderPurchased');
        basicEvent.saleAgreementID = purchase.saleAgreement.saleAgreementID;
        emit(basicEvent);

        return assetRegistry.update(purchase.saleAgreement);
      })
      .catch(function (error) {
        throw(error)
      });
  }  else {
    throw('Sale Agreement should be in approved status')
  }

}

/**
 * Sample transaction
 * @param {org.acme.titletransfer.ApproveTransaction} purchase
 * @transaction
 */
async function ApproveTransaction(purchase) {
  if  (purchase.saleAgreement.status === JSON.stringify(orderStatus.Purchased))
  { purchase.saleAgreement.completed = new Date().toISOString();
    purchase.saleAgreement.status = JSON.stringify(orderStatus.Completed);
    return getAssetRegistry('org.acme.titletransfer.SaleAgreement')
      .then(function (assetRegistry) {

        return assetRegistry.update(purchase.saleAgreement);
      }).then(function(){
        var deed = getFactory().newResource('org.acme.titletransfer', 'Deed', purchase.saleAgreement.propertyListing.MLS);
        deed.URL = purchase.saleAgreement.propertyListing.URL;
        deed.sqMeters = purchase.saleAgreement.propertyListing.sqMeters;
        deed.address = purchase.saleAgreement.propertyListing.address;
        deed.amount = purchase.saleAgreement.propertyListing.amount;
        deed.owner = purchase.saleAgreement.propertyListing.seller

        var basicEvent = getFactory().newEvent('org.acme.titletransfer', 'transactionCompleted');
        basicEvent.saleAgreementID = purchase.saleAgreement.saleAgreementID;
        emit(basicEvent);
        return getAssetRegistry('org.acme.titletransfer.Deed')
          .then(function (assetRegistry) {

            return assetRegistry.add(deed);
          }).catch(function (error) {
            throw(error)
          });
      }).catch(function (error) {
        // Add optional error handling here.
        throw(error)
      });
  }  else {
    throw('Sale Agreement should be in purchased status')
  }
}
