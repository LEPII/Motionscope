import Joi from "joi";
import mongoose from "mongoose";
import JoiObjectId from "joi-objectid";

const blockSchema = new mongoose.Schema({
  coach: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  athlete: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  blockName: { type: String, minLength: 1, maxLength: 50, required: true },
  numberOfWeeks: {
    type: Number,
    min: 1,
    max: 12,
    required: true,
  },
  blockStartDate: {
    type: Date,
    required: true,
    validate: [
      {
        validator: function (value) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const startDate = new Date(value);
          startDate.setHours(0, 0, 0, 0);
          return startDate >= today;
        },
        message: "Block start date must be today or in the future.",
      },
      {
        validator: function (value) {
          const dayOfWeek = value.getDay();
          return dayOfWeek === 0;
        },
        message: "Block start date must be a Sunday.",
      },
    ],
  },
  blockEndDate: {
    type: Date,
    required: true,
    validate: [
      {
        validator: function (value) {
          if (!this.blockStartDate || !this.numberOfWeeks) {
            return true;
          }
          const expectedEndDate = new Date(this.blockStartDate);
          // adds the starts date + the length of the block
          expectedEndDate.setDate(
            expectedEndDate.getDate() + this.numberOfWeeks * 7 - 1
          );
          const actualEndDate = new Date(value);
          actualEndDate.setHours(0, 0, 0, 0);
          expectedEndDate.setHours(0, 0, 0, 0);
          // compares the ACTUAL end date provided by the user
          // WITH the EXPECTED end date calculated above.
          return actualEndDate.getTime() === expectedEndDate.getTime();
        },
        message:
          "Block end date does not match the block start date and number of weeks selected.",
      },
      {
        validator: function (value) {
          const dayOfWeek = value.getDay();
          return dayOfWeek === 6;
        },
        message: "Block end date must be a Saturday.",
      },
    ],
  },
  days: {
    type: [String],
    enum: [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ],
    validate: {
      validator: function (v) {
        return v.length > 0;
      },
      message: "Please select at least one day",
    },
    required: true,
  },
  weeklySchedule: [
    {
      weekStartDate: {
        type: Date,
        required: true,
      },
      dailySchedule: [
        {
          primExercises: {
            type: [String],
            required: true,
            enum: [
              "Primary Squat",
              "Secondary Squat",
              "Volume Squat",
              "Primary Bench",
              "Secondary Bench",
              "Volume Bench",
              "Primary Deadlift",
              "Secondary Deadlift",
              "Volume Deadlift",
            ],
            validate: {
              validator: function (v) {
                return v.length > 0;
              },
              message: "Please select at least one title for the day.",
            },
          },
          customExercisesId: [
            { type: mongoose.Schema.Types.ObjectId, ref: "CustomExercise" },
          ],
          presetExercisesId: [
            { type: mongoose.Schema.Types.ObjectId, ref: "PresetExercise" },
          ],
        },
      ],
    },
  ],
});

const Block = mongoose.model("Block", blockSchema);

// const validateBlock = Joi.object({
//   coach: Joi.objectId().required(),
//   coach: Joi.objectId().required(),
//   blockName: Joi.string().min(1).max(50).required(),
//   numberOfWeeks: Joi.number().min(1).max(12).required(),
//   blockStartDate: Joi.date()
//     .default(() => new Date())
//     .required()
//     .greater("now")
//     .message("Start date must be today or in the future."),
//   days: Joi.array().items(
//     Joi.string().valid(
//       "Sunday",
//       "Monday",
//       "Tuesday",
//       "Wednesday",
//       "Thursday",
//       "Friday",
//       "Saturday"
//     )
//   ),
//   weeklySchedule: Joi.array()
//     .items(
//       Joi.object({
//         weekStartDate: Joi.date().required,
//         dailySchedule: Joi.array()
//           .items(
//             Joi.object({
//               primExercises: Joi.array()
//                 .items(
//                   Joi.string().valid(
//                     "Primary Squat",
//                     "Secondary Squat",
//                     "Volume Squat",
//                     "Primary Bench",
//                     "Secondary Bench",
//                     "Volume Bench",
//                     "Primary Deadlift",
//                     "Secondary Deadlift",
//                     "Volume Deadlift"
//                   )
//                 )
//                 .optional(),
//               customExercisesId: Joi.array().items(ObjectId).optional(),
//               presetExercisesId: Joi.array().items(ObjectId).optional(),
//               customExercisesId: Joi.when("presetExercisesId", {
//                 is: Joi.array().length(0),
//                 then: Joi.array().items(ObjectId).min(1),
//               }).optional(),
//               presetExercisesId: Joi.when("customExercisesId", {
//                 is: Joi.array().length(0),
//                 then: Joi.array().items(ObjectId).min(1),
//               }).optional(),
//             })
//           )
//           .min(1)
//           .required(),
//       })
//     )
//     .min(1)
//     .required(),
// });

export { Block };
