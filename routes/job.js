const express = require('express');
const router = express.Router();

/**
 * @swagger
 * /api/job:
 *   get:
 *     summary: Get all job applications
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/job', (req, res) => {
  res.status(200).json({
    message: 'List of all job applications',
  });
});

/**
 * @swagger
 * /api/job/{id}:
 *   get:
 *     summary: Get a specific job application by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Job ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/job/:id', (req, res) => {
  const jobId = req.params.id;
  res.status(200).json({
    message: `Job application with ID: ${jobId}`,
  });
});

/**
 * @swagger
 * /api/job:
 *   post:
 *     summary: Create a new job application
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/job', (req, res) => {
  const newJob = req.body;
  res.status(201).json({
    message: 'Job application created',
    job: newJob,
  });
});

/**
 * @swagger
 * /api/job/{id}:
 *   put:
 *     summary: Update a job application by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Job ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Updated
 */
router.put('/job/:id', (req, res) => {
  const jobId = req.params.id;
  const updatedJob = req.body;
  res.status(200).json({
    message: `Job application with ID: ${jobId} updated`,
    job: updatedJob,
  });
});

/**
 * @swagger
 * /api/job/{id}:
 *   delete:
 *     summary: Delete a job application by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Job ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deleted
 */
router.delete('/job/:id', (req, res) => {
  const jobId = req.params.id;
  res.status(200).json({
    message: `Job application with ID: ${jobId} deleted`,
  });
});

module.exports = router;