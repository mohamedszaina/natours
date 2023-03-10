const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const deleteOne = (Model) => 
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const doc = await Model.findByIdAndDelete(id);
    if (!doc) {
      return next(
        new AppError(404, `The document with the id:${id} dos'nt exist!`)
      );
    }
    res.status(204).json({ 
        status: 'suc', 
        message: null 
    });
  });


module.exports = { deleteOne };
