import {useMemo} from 'react';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList, Report} from '@src/types/onyx';
import useOnyx from './useOnyx';

type ReportIDToNameMap = Record<string, string>;
type AccountIDToNameMap = Record<string, string>;

function reportIDToNameSelector(reports: OnyxCollection<Report>): ReportIDToNameMap {
    const map: ReportIDToNameMap = {};
    if (!reports) {
        return map;
    }
    for (const report of Object.values(reports)) {
        if (!report) {
            continue;
        }
        map[report.reportID] = report.reportName ?? report.reportID;
    }
    return map;
}

function accountIDToNameSelector(personalDetailsList: OnyxEntry<PersonalDetailsList>): AccountIDToNameMap {
    const map: AccountIDToNameMap = {};
    if (!personalDetailsList) {
        return map;
    }
    for (const personalDetails of Object.values(personalDetailsList)) {
        if (!personalDetails) {
            continue;
        }
        map[personalDetails.accountID] = personalDetails.login ?? personalDetails.displayName ?? '';
    }
    return map;
}

type ParserExtras = {
    reportIDToName: ReportIDToNameMap;
    accountIDToName: AccountIDToNameMap;
};

function useParserExtras(): ParserExtras {
    const [reportIDToName] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {selector: reportIDToNameSelector});
    const [accountIDToName] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: accountIDToNameSelector});

    return useMemo(
        () => ({
            reportIDToName: reportIDToName ?? {},
            accountIDToName: accountIDToName ?? {},
        }),
        [reportIDToName, accountIDToName],
    );
}

export default useParserExtras;
export type {ParserExtras};
