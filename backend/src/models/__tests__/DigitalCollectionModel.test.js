jest.mock('../../config/database', () => ({
  getConnection: jest.fn(),
}));

const pool = require('../../config/database');
const DigitalCollectionModel = require('../DigitalCollectionModel');

describe('DigitalCollectionModel.createObjects Dublin Core metadata', () => {
  let connection;

  beforeEach(() => {
    jest.clearAllMocks();
    connection = {
      beginTransaction: jest.fn().mockResolvedValue(),
      commit: jest.fn().mockResolvedValue(),
      rollback: jest.fn().mockResolvedValue(),
      release: jest.fn(),
      query: jest.fn().mockResolvedValue([{ insertId: 42 }, {}]),
    };
    pool.getConnection.mockResolvedValue(connection);
  });

  test('persists Dublin Core fields and assigns a unique object identifier', async () => {
    await DigitalCollectionModel.createObjects('3', [{
      title: 'School newsletter',
      creator: 'School',
      dc_date: '1986',
      dc_subject: 'School; History',
      dc_description: 'A school newsletter.',
      dc_type: 'Text',
      dc_language: 'English',
      material_type: 'Newsletter',
      file_path: 'object.pdf',
      original_filename: 'newsletter.pdf',
      mime_type: 'application/pdf',
      file_size: 24,
      rights_status: 'Public Domain',
      rights_assessment_notes: 'Reviewed',
      is_public: false,
    }], 12);

    const [insertQuery, insertParameters] = connection.query.mock.calls[0];
    expect(insertQuery).toContain('dc_identifier');
    expect(insertQuery).toContain('dc_description');
    expect(insertParameters).toEqual(expect.arrayContaining([
      '3',
      'School newsletter',
      '1986',
      'School; History',
      'A school newsletter.',
      'Text',
      'English',
    ]));
    expect(insertParameters[1]).toMatch(/^KCU-DC-[a-f0-9]{32}$/);
    expect(insertParameters).toHaveLength(24);
    expect(connection.commit).toHaveBeenCalled();
    expect(connection.release).toHaveBeenCalled();
  });
});
