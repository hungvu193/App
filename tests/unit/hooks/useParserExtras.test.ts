import {act, renderHook, waitFor} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import useParserExtras from '@hooks/useParserExtras';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList, Report} from '@src/types/onyx';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const REPORT_ID_1 = '1';
const REPORT_ID_2 = '2';
const REPORT_ID_3 = '42';
const ACCOUNT_ID_ALICE = 100;
const ACCOUNT_ID_BOB = 200;

describe('useParserExtras', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await act(async () => {
            await Onyx.clear();
            await waitForBatchedUpdates();
        });
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
    });

    it('should return empty maps when no data exists', () => {
        const {result} = renderHook(() => useParserExtras());

        expect(result.current.reportIDToName).toEqual({});
        expect(result.current.accountIDToName).toEqual({});
    });

    it('should build reportIDToName from reports', async () => {
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID_1}`, {reportID: REPORT_ID_1, reportName: '#general'} as Report);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID_2}`, {reportID: REPORT_ID_2, reportName: '#random'} as Report);
            await waitForBatchedUpdates();
        });

        const {result} = renderHook(() => useParserExtras());

        await waitFor(() => {
            expect(result.current.reportIDToName).toEqual({
                [REPORT_ID_1]: '#general',
                [REPORT_ID_2]: '#random',
            });
        });
    });

    it('should fall back to reportID when reportName is missing', async () => {
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID_3}`, {reportID: REPORT_ID_3} as Report);
            await waitForBatchedUpdates();
        });

        const {result} = renderHook(() => useParserExtras());

        await waitFor(() => {
            expect(result.current.reportIDToName).toEqual({
                [REPORT_ID_3]: REPORT_ID_3,
            });
        });
    });

    it('should build accountIDToName from personal details using login', async () => {
        await act(async () => {
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                [ACCOUNT_ID_ALICE]: {accountID: ACCOUNT_ID_ALICE, login: 'alice@example.com', displayName: 'Alice'},
                [ACCOUNT_ID_BOB]: {accountID: ACCOUNT_ID_BOB, login: 'bob@example.com', displayName: 'Bob'},
            } as PersonalDetailsList);
            await waitForBatchedUpdates();
        });

        const {result} = renderHook(() => useParserExtras());

        await waitFor(() => {
            expect(result.current.accountIDToName).toEqual({
                [ACCOUNT_ID_ALICE]: 'alice@example.com',
                [ACCOUNT_ID_BOB]: 'bob@example.com',
            });
        });
    });

    it('should fall back to displayName when login is missing', async () => {
        await act(async () => {
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                [ACCOUNT_ID_ALICE]: {accountID: ACCOUNT_ID_ALICE, displayName: 'Alice'},
            } as PersonalDetailsList);
            await waitForBatchedUpdates();
        });

        const {result} = renderHook(() => useParserExtras());

        await waitFor(() => {
            expect(result.current.accountIDToName).toEqual({
                [ACCOUNT_ID_ALICE]: 'Alice',
            });
        });
    });

    it('should fall back to empty string when both login and displayName are missing', async () => {
        await act(async () => {
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                [ACCOUNT_ID_ALICE]: {accountID: ACCOUNT_ID_ALICE},
            } as PersonalDetailsList);
            await waitForBatchedUpdates();
        });

        const {result} = renderHook(() => useParserExtras());

        await waitFor(() => {
            expect(result.current.accountIDToName).toEqual({
                [ACCOUNT_ID_ALICE]: '',
            });
        });
    });

    it('should skip null entries in reports', async () => {
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID_1}`, {reportID: REPORT_ID_1, reportName: '#general'} as Report);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID_2}`, null);
            await waitForBatchedUpdates();
        });

        const {result} = renderHook(() => useParserExtras());

        await waitFor(() => {
            expect(result.current.reportIDToName).toEqual({
                [REPORT_ID_1]: '#general',
            });
        });
    });

    it('should skip null entries in personal details', async () => {
        await act(async () => {
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                [ACCOUNT_ID_ALICE]: {accountID: ACCOUNT_ID_ALICE, login: 'alice@example.com'},
                [ACCOUNT_ID_BOB]: null,
            } as PersonalDetailsList);
            await waitForBatchedUpdates();
        });

        const {result} = renderHook(() => useParserExtras());

        await waitFor(() => {
            expect(result.current.accountIDToName).toEqual({
                [ACCOUNT_ID_ALICE]: 'alice@example.com',
            });
        });
    });

    it('should update reactively when a report is added', async () => {
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID_1}`, {reportID: REPORT_ID_1, reportName: '#general'} as Report);
            await waitForBatchedUpdates();
        });

        const {result} = renderHook(() => useParserExtras());

        await waitFor(() => {
            expect(result.current.reportIDToName).toEqual({[REPORT_ID_1]: '#general'});
        });

        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID_2}`, {reportID: REPORT_ID_2, reportName: '#random'} as Report);
            await waitForBatchedUpdates();
        });

        await waitFor(() => {
            expect(result.current.reportIDToName).toEqual({
                [REPORT_ID_1]: '#general',
                [REPORT_ID_2]: '#random',
            });
        });
    });

    it('should update reactively when personal details change', async () => {
        await act(async () => {
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                [ACCOUNT_ID_ALICE]: {accountID: ACCOUNT_ID_ALICE, displayName: 'Alice'},
            } as PersonalDetailsList);
            await waitForBatchedUpdates();
        });

        const {result} = renderHook(() => useParserExtras());

        await waitFor(() => {
            expect(result.current.accountIDToName).toEqual({[ACCOUNT_ID_ALICE]: 'Alice'});
        });

        await act(async () => {
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                [ACCOUNT_ID_ALICE]: {accountID: ACCOUNT_ID_ALICE, login: 'alice@example.com', displayName: 'Alice'},
            } as PersonalDetailsList);
            await waitForBatchedUpdates();
        });

        await waitFor(() => {
            expect(result.current.accountIDToName).toEqual({[ACCOUNT_ID_ALICE]: 'alice@example.com'});
        });
    });

    it('should provide both maps simultaneously', async () => {
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID_1}`, {reportID: REPORT_ID_1, reportName: '#general'} as Report);
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                [ACCOUNT_ID_ALICE]: {accountID: ACCOUNT_ID_ALICE, login: 'alice@example.com'},
            } as PersonalDetailsList);
            await waitForBatchedUpdates();
        });

        const {result} = renderHook(() => useParserExtras());

        await waitFor(() => {
            expect(result.current.reportIDToName).toEqual({[REPORT_ID_1]: '#general'});
            expect(result.current.accountIDToName).toEqual({[ACCOUNT_ID_ALICE]: 'alice@example.com'});
        });
    });
});
