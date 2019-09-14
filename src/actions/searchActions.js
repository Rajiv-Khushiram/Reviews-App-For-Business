import 'firebase/firestore'
import algoliasearch from 'algoliasearch'

export const search = (search) => {
  return (dispatch, getState) => {
    var purchasedDocQuery = []
    var customerIds = []

    // Algolia APPID & API_Key
    var client = algoliasearch('AAZ0ITKMEO', 'cef8d84b4179a7575b4af526ba345df2')

    var indexPurchases = client.initIndex('purchases')
    var indexCustomers = client.initIndex('customers')
    const business = getState().account.business
    console.log(business)
    indexPurchases
      .search(
        {
          query: search,
          filters: 'business_id:' + business,
          attributesToRetrieve: ['customer_id'],
          hitsPerPage: 50
        }).then(function (responses) {
        purchasedDocQuery = responses.hits
        for (var i = 0; i < purchasedDocQuery.length; i++) {
          var obj = purchasedDocQuery[i]
          customerIds.push(obj._highlightResult.customer_id.value)
        }

        indexCustomers.getObjects(customerIds, (err, content) => {
          if (err) throw err
          var query = content.results
          dispatch({ type: 'RETRIEVE_SUCCESS', query })
        })
      })
  }
}
