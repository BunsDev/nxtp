import { SinonStub, stub } from "sinon";
import { delay, XTransfer, expect, getRandomBytes32 } from "@connext/nxtp-utils";

import * as bindCacheFns from "../../../src/bindings/cache/index";
import { mock, stubContext, stubOperations } from "../../mock";

describe("Bindings:Cache", () => {
  let mockContext: any;
  let getOperationsStub: SinonStub;

  beforeEach(() => {
    mockContext = stubContext();
    getOperationsStub = stubOperations();
  });

  describe("#bindCache", async () => {
    let pollStub: SinonStub;
    beforeEach(() => {
      pollStub = stub(bindCacheFns, "pollCache").resolves();
    });

    afterEach(() => {
      pollStub.restore();
    });

    it("happy: should start an interval loop that calls polling fn", async () => {
      // Override the poll interval to 10ms so we can test the interval loop
      bindCacheFns.bindCache(10);
      // TODO: slight race here?
      await delay(20);
      mockContext.config.mode.cleanup = true;
      await delay(10);
      expect(pollStub.callCount).to.be.gte(1);
    });
  });

  describe("#pollCache", () => {
    let executeStub: SinonStub;
    beforeEach(() => {
      executeStub = stub().resolves();
      getOperationsStub.returns({
        execute: executeStub,
      });
    });
    it("happy: should retrieve pending transfers from the cache", async () => {
      const mockCachedTransfers: { [transferId: string]: XTransfer } = {};
      const mockPendingTransfers: string[] = [];
      for (let i = 0; i < 10; i++) {
        const mockTransfer: XTransfer = mock.entity.xtransfer();
        const rand_num = i % 3;
        if (rand_num === 0) {
          mockCachedTransfers[mockTransfer.transferId] = mockTransfer;
        } else if (rand_num === 1) {
          mockCachedTransfers[mockTransfer.transferId] = { ...mockTransfer, xcall: undefined };
        } else {
          mockCachedTransfers[mockTransfer.transferId] = {
            ...mockTransfer,
            execute: { ...mockTransfer.execute, transactionHash: getRandomBytes32() },
          };
        }

        mockPendingTransfers.push(mockTransfer.transferId);
      }
      const domainWithPending = "1234";
      const domainWithNoPending = "5678";
      const domainWithNoAssets = "9012";

      // Add a fake pending transfer to the cache. This should be ignored by the method, since it won't have data in the cache.
      mockPendingTransfers.push(getRandomBytes32());

      mockContext.adapters.cache.transfers.getPending.callsFake((domain: string) =>
        domain === domainWithPending ? mockPendingTransfers : [],
      );

      mockContext.adapters.cache.transfers.getTransfer.callsFake(
        (transferId: string) => mockCachedTransfers[transferId],
      );

      mockContext.adapters.subgraph.getExecutedAndReconciledTransfers.resolves([]);

      mockContext.config.chains = {
        [domainWithPending]: mockContext.config.chains[mock.chain.A],
        [domainWithNoPending]: mockContext.config.chains[mock.chain.B],
        [domainWithNoAssets]: {
          ...mockContext.config.chains[mock.chain.B],
          // Should skip this domain, since there are no assets configured for it!
          assets: [],
        },
      };

      await bindCacheFns.pollCache();

      // Should have been called once per the chain with assets configured.
      expect(mockContext.adapters.cache.transfers.getPending).to.have.been.calledWithExactly(domainWithPending);
      expect(mockContext.adapters.cache.transfers.getPending).to.have.been.calledWithExactly(domainWithNoPending);
      expect(mockContext.adapters.cache.transfers.getPending.callCount).to.be.eq(2);
      for (const transferId of mockPendingTransfers) {
        expect(mockContext.adapters.cache.transfers.getTransfer).to.have.been.calledWithExactly(transferId);
      }
    });

    it("should save error if transfer fails", async () => {
      const pending = mock.entity.xtransfer();
      const domain = "1234";
      const mockError = new Error("fail");

      mockContext.adapters.cache.transfers.getPending.resolves([pending.transferId]);

      mockContext.adapters.cache.transfers.getTransfer.resolves(pending);

      mockContext.config.chains = {
        [domain]: mockContext.config.chains[mock.chain.A],
      };

      executeStub.rejects(mockError);

      mockContext.adapters.subgraph.getExecutedAndReconciledTransfers.resolves([]);

      await bindCacheFns.pollCache();

      expect(mockContext.adapters.cache.transfers.getPending).to.have.been.calledWithExactly(domain);
      expect(mockContext.adapters.cache.transfers.saveError).to.have.been.calledOnceWithExactly(
        pending.transferId,
        mockError.toString(),
      );
    });
  });
});