import {render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxProvider from '@components/OnyxProvider';
import ReportPreview from '@components/ReportActionItem/ReportPreview';
import {translateLocal} from '@libs/Localize';
import type Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import createRandomReportAction from '../../utils/collections/reportActions';
import createRandomReport from '../../utils/collections/reports';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const emptyFunction = () => {};
jest.mock('@rnmapbox/maps', () => {
    return {
        default: jest.fn(),
        MarkerView: jest.fn(),
        setAccessToken: jest.fn(),
    };
});

jest.mock('@react-native-community/geolocation', () => ({
    setRNConfiguration: jest.fn(),
}));

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof Navigation>('@react-navigation/native');
    return {
        ...actualNav,
        useRoute: () => jest.fn(),
    };
});

describe('ReportPreview', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    it('should update preview message when the invoice receiver detail is updated', async () => {
        // Given an invoice report preview
        const chatReportID = '1';
        const iouReportID = '2';
        const accountID = 3;
        let displayName = 'test';
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`, {
            ...createRandomReport(Number(chatReportID)),
            chatType: CONST.REPORT.CHAT_TYPE.INVOICE,
            invoiceReceiver: {
                accountID,
                type: CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL,
            },
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`, {
            ...createRandomReport(Number(chatReportID)),
            type: CONST.REPORT.TYPE.INVOICE,
            isWaitingOnBankAccount: false,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
        });
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
            [accountID]: {
                displayName,
            },
        });

        render(
            <OnyxProvider>
                <LocaleContextProvider>
                    <ReportPreview
                        iouReportID={iouReportID}
                        chatReportID={chatReportID}
                        action={createRandomReportAction(0)}
                        policyID=""
                        checkIfContextMenuActive={emptyFunction}
                        onShowContextMenu={emptyFunction}
                    />
                </LocaleContextProvider>
            </OnyxProvider>,
        );

        await waitForBatchedUpdates();

        expect(screen.getByTestId('reportPreview-previewMessage')).toHaveTextContent(translateLocal('iou.payerOwes', {payer: displayName}));

        // When the invoice receiver display name is updated
        displayName = 'test edit';
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
            [accountID]: {
                displayName,
            },
        });

        // Then the report preview's preview message should be updated using the new display name
        expect(screen.getByTestId('reportPreview-previewMessage')).toHaveTextContent(translateLocal('iou.payerOwes', {payer: displayName}));
    });
});
