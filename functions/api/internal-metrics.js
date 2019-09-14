const admin = require("firebase-admin");

module.exports= function(req, res) {
  const getImages = () => {
    return admin
      .firestore()
      .collection("photos")
      .where("created", "<", new Date())
      .get()
      .then(snapshot => {
        const photos = snapshot.docs.map(doc => {
          return { ...doc.data() };
        });
        return { photos };
      });
  };
  const getCustomers = () => {
    return admin
      .firestore()
      .collection("customers")
      .where("created", "<", new Date())
      .get()
      .then(snapshot => {
        const customers = snapshot.docs.map(doc => {
          return { ...doc.data() };
        });
        return { customers };
      });
  };
  const getBusinesses = () => {
    return admin
      .firestore()
      .collection("businesses")
      .get()
      .then(snapshot => {
        const businesses = snapshot.docs.map(doc => {
          return { ...doc.data() };
        });
        return { businesses };
      });
  };
  const getAccounts = () => {
    return admin
      .firestore()
      .collection("accounts")
      .get()
      .then(snapshot => {
        const accounts = snapshot.docs.map(doc => {
          return { ...doc.data() };
        });
        return { accounts };
      });
  };

  const getMessages = () => {
    return admin
      .firestore()
      .collection("messages")
      .get()
      .then(snapshot => {
        const messages = snapshot.docs.map(doc => {
          return { ...doc.data() };
        });
        return { messages };
      });
  };

  const getBusinessMessageCount = () => {
    let businessesColection = admin.firestore().collection('businesses')
    return businessesColection.orderBy('name').orderBy('message_count', 'desc');
  }

  Promise.all([
    getImages(),
    getCustomers(),
    getBusinesses(),
    getAccounts(),
    getBusinessMessageCount()
    ,getMessages()
  ]).then(result => {
    var obj = {};
    result.map((e, i) => {
      obj[Object.keys(e)[0]] = e[Object.keys(e)[0]];
    });
    res.status(200).send(obj);
  });
}