/**
 * Lightweight, production-ready schema validation middleware for Briefs Studio.
 * Enforces strict validation of API payloads without bulky external npm package weights.
 */

export function validateIncubationPayload(req, res, next) {
  const { notes, archetype } = req.body;

  const errors = [];

  // Validate notes
  if (notes === undefined || notes === null) {
    errors.push({ field: 'notes', error: 'Notes field is strictly required.' });
  } else if (typeof notes !== 'string') {
    errors.push({ field: 'notes', error: 'Notes must be a valid text string.' });
  } else if (notes.trim().length < 10) {
    errors.push({ field: 'notes', error: 'Notes must contain at least 10 characters of client context.' });
  }

  // Validate archetype
  const validArchetypes = [
    'Systems Integrator',
    'Creative Strategist',
    'Operations Orchestrator',
    'Narrative Architect'
  ];

  if (archetype && typeof archetype !== 'string') {
    errors.push({ field: 'archetype', error: 'Archetype must be a valid text string.' });
  } else if (archetype && !validArchetypes.includes(archetype)) {
    errors.push({ 
      field: 'archetype', 
      error: `Archetype must be one of: ${validArchetypes.join(', ')}` 
    });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Bad Request: Schema Validation Failed',
      status: 400,
      timestamp: new Date().toISOString(),
      details: errors
    });
  }

  // Normalize defaults
  if (!req.body.archetype) {
    req.body.archetype = 'Systems Integrator';
  }

  next();
}
