import { BatchClient } from '../../src/utils/batch';
import { createBlockForDevnet, getTestProvider } from '../config/fixtures';
import { initializeMatcher } from '../config/schema';

describe('Batch Client', () => {
  const provider = getTestProvider(false);

  const batchClient = new BatchClient({
    nodeUrl: provider.channel.nodeUrl,
    headers: provider.channel.headers,
    interval: 0,
  });

  initializeMatcher(expect);

  test('should batch two requests', async () => {
    await createBlockForDevnet();

    const fetchSpy = jest.spyOn(batchClient as any, 'sendBatch');

    const [blockNumber, blockWithReceipts] = await Promise.all([
      batchClient.fetch('starknet_blockNumber'),
      batchClient.fetch('starknet_getBlockWithReceipts', { block_id: 'latest' }),
    ]);

    expect(typeof blockNumber.result).toBe('number');
    expect(blockWithReceipts.result).toMatchSchemaRef('BlockWithTxReceipts');

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    fetchSpy.mockRestore();
  });

  test('batch request using Provider', async () => {
    const myBatchProvider = getTestProvider(false, {
      batch: 0,
    });

    // eslint-disable-next-line @typescript-eslint/dot-notation
    const sendBatchSpy = jest.spyOn(myBatchProvider.channel['batchClient'] as any, 'sendBatch');

    await Promise.all([
      myBatchProvider.getBlock(),
      myBatchProvider.getBlockLatestAccepted(),
      myBatchProvider.getBlockTransactionCount('latest'),
    ]);

    expect(sendBatchSpy).toHaveBeenCalledTimes(1);
  });
});
