import { beforeEach, describe, expect, it, vi } from 'vitest';
import { stocksApi } from '../stocks';

const { post, notifySystemConfigChanged } = vi.hoisted(() => ({
  post: vi.fn(),
  notifySystemConfigChanged: vi.fn(),
}));

vi.mock('../index', () => ({
  default: { post },
}));

vi.mock('../alphasift', () => ({
  notifySystemConfigChanged: () => notifySystemConfigChanged(),
}));

describe('stocksApi', () => {
  beforeEach(() => {
    post.mockReset();
    notifySystemConfigChanged.mockReset();
  });

  it('notifies shared configuration consumers after batch watchlist updates', async () => {
    post.mockResolvedValueOnce({
      data: { stock_codes: ['600519', '300750'], message: '已加入 2 只股票' },
    });

    const result = await stocksApi.addManyToWatchlist(['600519', '300750']);

    expect(post).toHaveBeenCalledWith('/api/v1/stocks/watchlist/add-batch', {
      stock_codes: ['600519', '300750'],
    });
    expect(result).toEqual({ stockCodes: ['600519', '300750'], message: '已加入 2 只股票' });
    expect(notifySystemConfigChanged).toHaveBeenCalledTimes(1);
  });
});
