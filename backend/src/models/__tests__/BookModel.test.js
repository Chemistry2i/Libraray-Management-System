jest.mock('../../config/database', () => ({
  getConnection: jest.fn(),
}));

const pool = require('../../config/database');
const BookModel = require('../BookModel');

let connection;
let copies;
let openLoans;

beforeEach(() => {
  jest.clearAllMocks();
  copies = [];
  openLoans = [];
  connection = {
    beginTransaction: jest.fn().mockResolvedValue(),
    commit: jest.fn().mockResolvedValue(),
    rollback: jest.fn().mockResolvedValue(),
    release: jest.fn(),
    query: jest.fn(async (sql) => {
      if (sql.startsWith('SELECT copy_id, status')) return [copies, {}];
      if (sql.startsWith('SELECT copy_id FROM borrowing_records')) return [openLoans, {}];
      return [{ affectedRows: 1 }, {}];
    }),
  };
  pool.getConnection.mockResolvedValue(connection);
});

describe('BookModel.update inventory', () => {
  test('adds available copy rows when total copies increase', async () => {
    copies = [
      { copy_id: 1, status: 'borrowed' },
      { copy_id: 2, status: 'available' },
      { copy_id: 3, status: 'available' },
    ];
    openLoans = [{ copy_id: 1 }, { copy_id: 2 }];

    await BookModel.update(12, { total_copies: 4 });

    expect(connection.query).toHaveBeenCalledWith(
      'INSERT INTO book_copies (book_id, status) VALUES (?, \'available\')',
      [12]
    );
    expect(connection.query).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE books SET total_copies = ?, available_copies = ?'),
      [4, 3, 12]
    );
    expect(connection.commit).toHaveBeenCalled();
  });

  test('removes only available copies with no open borrowing record', async () => {
    copies = [
      { copy_id: 1, status: 'borrowed' },
      { copy_id: 2, status: 'available' },
      { copy_id: 3, status: 'available' },
    ];
    openLoans = [{ copy_id: 1 }, { copy_id: 2 }];

    await BookModel.update(12, { total_copies: 2 });

    expect(connection.query).toHaveBeenCalledWith(
      'DELETE FROM book_copies WHERE copy_id IN (?)',
      [3]
    );
    expect(connection.query).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE books SET total_copies = ?, available_copies = ?'),
      [2, 1, 12]
    );
    expect(connection.commit).toHaveBeenCalled();
  });

  test('rejects a total below copies attached to open loans', async () => {
    copies = [
      { copy_id: 1, status: 'borrowed' },
      { copy_id: 2, status: 'available' },
    ];
    openLoans = [{ copy_id: 1 }, { copy_id: 2 }];

    await expect(BookModel.update(12, { total_copies: 1 }))
      .rejects.toThrow('Total copies cannot be lower than 2');

    expect(connection.rollback).toHaveBeenCalled();
    expect(connection.commit).not.toHaveBeenCalled();
  });
});
