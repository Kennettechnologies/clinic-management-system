const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// @desc    Check symptoms using AI
// @route   POST /api/ai/symptoms
// @access  Private
exports.checkSymptoms = asyncHandler(async (req, res, next) => {
  const { symptoms } = req.body;

  if (!symptoms) {
    return next(new ErrorResponse('Please provide symptoms', 400));
  }

  try {
    const prompt = `Based on the following symptoms, suggest possible conditions: ${symptoms}`;
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 150
    });

    res.status(200).json({
      success: true,
      data: response.choices[0].message.content
    });
  } catch (err) {
    return next(new ErrorResponse('AI analysis failed', 500));
  }
});

// @desc    Optimize appointment scheduling using AI
// @route   POST /api/ai/appointments/optimize
// @access  Private
exports.optimizeAppointments = asyncHandler(async (req, res, next) => {
  const { doctorSchedule, patientPreferences, existingAppointments } = req.body;

  if (!doctorSchedule || !patientPreferences) {
    return next(new ErrorResponse('Please provide doctor schedule and patient preferences', 400));
  }

  try {
    const prompt = `Given the doctor's schedule: ${JSON.stringify(doctorSchedule)}, patient preferences: ${JSON.stringify(patientPreferences)}, and existing appointments: ${JSON.stringify(existingAppointments)}, suggest the top 3 optimal appointment slots.`;
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 200
    });

    res.status(200).json({
      success: true,
      data: response.choices[0].message.content
    });
  } catch (err) {
    return next(new ErrorResponse('AI appointment optimization failed', 500));
  }
}); 