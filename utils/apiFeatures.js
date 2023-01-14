class apiFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  // Build the query

  // 1) Filtering
  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]); // to exclude ['page', 'sort', 'limit', 'fields'] from the queryObj

    // console.log(queryObj);
    // console.log(req.query);

    let queryStr = JSON.stringify(queryObj); // To convert the object to a string
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    const advancedqueryObj = JSON.parse(queryStr); // To convert the string to an object
    // console.log(advancedqueryObj);

    this.query = this.query.find(advancedqueryObj);
    return this;
  }

  // 2) Sorting
  sort() {
    const sort = this.queryString.sort;
    if (sort) {
      const sortBy = sort.split(',').join(' ');
      // const sortBy = this.queryString.sort.split(',').join(' ');
      // console.log(sort);
      // console.log(sortBy);
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  // 3) Fields limiting
  limitFields() {
    // (Specifies which document fields to include or exclude (also known as the query "projection"))
    const fields = this.queryString.fields;
    if (fields) {
      // document fields to include
      const fieldsBy = fields.split(',').join(' ');
      this.query = this.query.select(fieldsBy);
    } else {
      // document fields to exclude
      this.query = this.query.select('-__v -createdAt');
    }
    return this;
  }

  // 4) pagination (how many documents to show per page)
  pagination() {
    // *1 means:-> convert the value from string to number
    // ||1 means:-> the default value is 1 if there is no value
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    // if the page doesn't exists
    // const numberOfDocuments = await this.query.countDocuments();
    // if (skip >= numberOfDocuments) {
    //   throw new Error("This page doesn't exist");
    // }
    return this;
  }
}
module.exports = apiFeatures;
