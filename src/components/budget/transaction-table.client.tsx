"use client";

import * as React from "react";
import {useMemo, useRef, useState, useTransition} from "react";
import {useLocale, useTranslations} from "next-intl";
import {Ban, FileText, FileUp, FileX, MoreHorizontal, Pencil, Plus, X} from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {Input} from "@/components/ui/input";
import {Switch} from "@/components/ui/switch";
import {DataEmpty} from "@/components/data-empty";
import {DataFilter} from "@/components/data-filter";
import {DataTable, type DataTableColumnDef, SortableHeader} from "@/components/data-table.client";
import {catalogName} from "@/components/catalog/catalog";
import {OwnerLabel, type OwnerValue} from "@/components/owner/owner-label";
import type {OwnerMember} from "@/components/owner/owner-field.client";
import {AmountText, type BudgetCategoryValue} from "@/components/budget/budget-labels";
import {type BudgetLineOption, type EditableTransaction, TransactionDialog} from "@/components/budget/transaction-dialog.client";
import {receiptUrl, removeReceipt, uploadReceipt} from "@/components/budget/receipt";
import {useReceiptFeedback} from "@/components/budget/use-receipt-feedback.client";
import {UrlSwitch} from "@/components/budget/url-switch.client";
import {cancelTransactionAction, setReimbursedAction} from "@/app/(app)/revivals/[id]/budget/actions.server";
import {useActionFeedback} from "@/hooks/use-action-feedback";
import {RECEIPT_TYPES} from "@/lib/budget/schema";
import {formatDate} from "@/utils/format";
import {cn} from "@/utils/utils";

export type TransactionRow = EditableTransaction & {
    budgetLine?: { id: string; description: string; removed?: boolean } | null;
    paidBy?: OwnerValue & EditableTransaction["paidBy"];
    reimbursed: boolean;
    reimbursedAt?: string | null;
    receipt?: { filename: string; contentType: string; size: number; uploadedAt: string } | null;
    cancelled: boolean;
};

export type TransactionFilter = {
    query: string;
    categories: Set<string>;
    kinds: Set<string>;
    notReimbursed: boolean;
    missingReceipt: boolean;
};

export const EMPTY_TRANSACTION_FILTER: TransactionFilter = {query: "", categories: new Set(), kinds: new Set(), notReimbursed: false, missingReceipt: false};

/**
 * Every word must appear in the description, the category, the budget line, the payer or the date; then the chosen
 * categories and kinds, costs paid by someone and not yet reimbursed, and transactions without a receipt.
 */
export function filterTransactions(transactions: TransactionRow[], filter: TransactionFilter, locale: string): TransactionRow[] {
    const words = filter.query.toLowerCase().split(/\s+/).filter(Boolean);

    return transactions.filter(transaction => {
        const payer = transaction.paidBy?.person?.displayName ?? transaction.paidBy?.name ?? "";
        const text = `${transaction.description} ${catalogName(transaction.category, locale)} ${transaction.budgetLine?.description ?? ""} ${payer} ${transaction.date}`
            .toLowerCase();

        return words.every(word => text.includes(word))
            && (filter.categories.size === 0 || filter.categories.has(transaction.category.id))
            && (filter.kinds.size === 0 || filter.kinds.has(transaction.category.kind))
            && (!filter.notReimbursed || (!!transaction.paidBy && !transaction.reimbursed))
            && (!filter.missingReceipt || !transaction.receipt);
    });
}

function ReimbursedCell({transaction, revivalId, canWrite}: { transaction: TransactionRow; revivalId: string; canWrite: boolean }) {
    const t = useTranslations("Budget");
    const feedback = useActionFeedback();
    const [pending, startTransition] = useTransition();

    if (!transaction.paidBy) {
        return <span className="text-muted-foreground">—</span>;
    }
    if (!canWrite || transaction.cancelled) {
        return transaction.reimbursed ? <Badge variant="secondary">{t("reimbursedYes")}</Badge> : <Badge variant="outline">{t("reimbursedNo")}</Badge>;
    }
    // Toggling it must not open the row's dialog
    return (
        <span className="inline-flex" onClick={click => click.stopPropagation()}>
            <Switch checked={transaction.reimbursed} disabled={pending} aria-label={t("reimbursedFor", {description: transaction.description})}
                    onCheckedChange={reimbursed => startTransition(async () => {
                        feedback(await setReimbursedAction({revivalId, id: transaction.id, version: transaction.version, reimbursed}),
                            reimbursed ? t("markedReimbursed") : t("markedNotReimbursed"));
                    })}/>
        </span>
    );
}

function ReceiptCell({transaction}: { transaction: TransactionRow }) {
    const t = useTranslations("Budget");

    if (!transaction.receipt) {
        return <span className={cn("text-xs", transaction.cancelled ? "text-muted-foreground" : "text-destructive")}>{t("noReceipt")}</span>;
    }
    return (
        <a href={receiptUrl(transaction.id)} download className="inline-flex items-center hover:text-foreground" onClick={click => click.stopPropagation()}
           aria-label={t("downloadReceipt", {filename: transaction.receipt.filename})} title={transaction.receipt.filename}>
            <FileText className="size-4"/>
        </a>
    );
}

function RowActions({transaction, onEdit, onCancel, onUpload, onRemoveReceipt}: {
    transaction: TransactionRow;
    onEdit: (transaction: TransactionRow) => void;
    onCancel: (transaction: TransactionRow) => void;
    onUpload: (transaction: TransactionRow) => void;
    onRemoveReceipt: (transaction: TransactionRow) => void;
}) {
    const t = useTranslations("Budget");

    if (transaction.cancelled) {
        return null;
    }
    return (
        <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" className="h-8 w-8 p-0" aria-label={t("rowMenu", {name: transaction.description})}/>}>
                <MoreHorizontal className="h-4 w-4"/>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(transaction)}><Pencil/>{t("edit")}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onUpload(transaction)}><FileUp/>{transaction.receipt ? t("replaceReceipt") : t("uploadReceipt")}</DropdownMenuItem>
                {transaction.receipt && <DropdownMenuItem onClick={() => onRemoveReceipt(transaction)}><FileX/>{t("removeReceipt")}</DropdownMenuItem>}
                <DropdownMenuSeparator/>
                <DropdownMenuItem variant="destructive" onClick={() => onCancel(transaction)}><Ban/>{t("cancelTransaction")}</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function CancelDialog({transaction, revivalId, onOpenChange}: { transaction: TransactionRow; revivalId: string; onOpenChange: (open: boolean) => void }) {
    const t = useTranslations();
    const feedback = useActionFeedback();
    const [pending, startTransition] = useTransition();

    return (
        <AlertDialog open onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t("Budget.cancelTitle", {description: transaction.description})}</AlertDialogTitle>
                    <AlertDialogDescription>{t("Budget.cancelDescription")}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>{t("Common.cancel")}</AlertDialogCancel>
                    <AlertDialogAction variant="destructive" disabled={pending} onClick={() => startTransition(async () => {
                        if (feedback(await cancelTransactionAction({revivalId, id: transaction.id, version: transaction.version}), t("Budget.transactionCancelled"))) {
                            onOpenChange(false);
                        }
                    })}>
                        {t("Budget.cancelTransaction")}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

function useColumns(revivalId: string, canWrite: boolean, actions: Omit<React.ComponentProps<typeof RowActions>, "transaction">) {
    const t = useTranslations("Budget");
    const locale = useLocale();

    const columns: DataTableColumnDef<TransactionRow>[] = [
        {
            id: "date",
            accessorFn: transaction => transaction.date,
            sortFn: "alphanumeric",
            header: ({column}) => <SortableHeader column={column} sorted={column.getIsSorted()} title={t("date")}/>,
            cell: ({row}) => <span className="whitespace-nowrap tabular-nums">{formatDate(row.original.date)}</span>,
            meta: {className: "w-28"},
        },
        {
            id: "description",
            accessorFn: transaction => transaction.description,
            sortFn: "alphanumeric",
            header: ({column}) => <SortableHeader column={column} sorted={column.getIsSorted()} title={t("description")}/>,
            cell: ({row}) => {
                const transaction = row.original;

                return (
                    <div className="flex min-w-40 flex-col items-start gap-1 whitespace-normal">
                        <span className="flex flex-wrap items-center gap-2">
                            {transaction.description}
                            {transaction.cancelled && <Badge variant="outline">{t("cancelled")}</Badge>}
                        </span>
                        <span className="flex flex-wrap gap-x-3 text-xs text-muted-foreground">
                            <span className="md:hidden">{catalogName(transaction.category, locale)}</span>
                            {transaction.budgetLine && <span>{t("againstLine", {description: transaction.budgetLine.description})}</span>}
                            {transaction.paidBy && <span className="lg:hidden">{t("paidByName", {
                                name: transaction.paidBy.person?.displayName ?? transaction.paidBy.name ?? "",
                            })}</span>}
                        </span>
                    </div>
                );
            },
        },
        {
            id: "category",
            accessorFn: transaction => catalogName(transaction.category, locale),
            sortFn: "alphanumeric",
            header: ({column}) => <SortableHeader column={column} sorted={column.getIsSorted()} title={t("category")}/>,
            cell: ({row}) => <Badge variant={row.original.category.kind === "INCOME" ? "secondary" : "outline"}>{catalogName(row.original.category, locale)}</Badge>,
            meta: {className: "hidden md:table-cell"},
        },
        {
            id: "amount",
            accessorFn: transaction => Number(transaction.amount),
            sortFn: "basic",
            header: ({column}) => <SortableHeader column={column} sorted={column.getIsSorted()} title={t("amount")}/>,
            cell: ({row}) => {
                const income = row.original.category.kind === "INCOME";

                return (
                    <span className={cn("block text-right font-medium", income && !row.original.cancelled && "text-emerald-700 dark:text-emerald-400")}>
                        <span className="sr-only">{t(`kinds.${row.original.category.kind}`)} </span>
                        {income ? "+" : "−"}<AmountText value={row.original.amount}/>
                    </span>
                );
            },
            meta: {className: "text-right"},
        },
        {
            id: "paidBy",
            header: () => t("paidBy"),
            cell: ({row}) => row.original.paidBy ? <OwnerLabel owner={row.original.paidBy}/> : <span className="text-muted-foreground">—</span>,
            meta: {className: "hidden lg:table-cell"},
        },
        {
            id: "reimbursed",
            header: () => t("reimbursed"),
            cell: ({row}) => <ReimbursedCell transaction={row.original} revivalId={revivalId} canWrite={canWrite}/>,
            meta: {className: "w-24"},
        },
        {
            id: "receipt",
            header: () => t("receipt"),
            cell: ({row}) => <ReceiptCell transaction={row.original}/>,
            meta: {className: "w-20"},
        },
    ];

    if (canWrite) {
        columns.push({
            id: "actions",
            header: () => <span className="sr-only">{t("actions")}</span>,
            cell: ({row}) => <RowActions transaction={row.original} {...actions}/>,
            meta: {className: "w-12 text-right"},
        });
    }
    return columns;
}

function ToggleFilter({pressed, onChange, children}: { pressed: boolean; onChange: (pressed: boolean) => void; children: React.ReactNode }) {
    return (
        <Button variant={pressed ? "secondary" : "outline"} size="sm" className="h-8 border-dashed" aria-pressed={pressed} onClick={() => onChange(!pressed)}>
            {children}
        </Button>
    );
}

/**
 * The budget's transactions (M5): costs and income with who paid, whether they are reimbursed and their receipts. Filters
 * by category and kind, costs not reimbursed and missing receipts; cancelled ones on request. Transactions are never
 * deleted, only cancelled.
 */
export function TransactionTable({revivalId, transactions, categories, lines, members, canWrite, showCancelled}: {
    revivalId: string;
    transactions: TransactionRow[];
    /** The active categories, for new transactions. */
    categories: BudgetCategoryValue[];
    lines: BudgetLineOption[];
    members: OwnerMember[];
    canWrite: boolean;
    showCancelled: boolean;
}) {
    const t = useTranslations();
    const locale = useLocale();
    const receiptFeedback = useReceiptFeedback();
    const [filter, setFilter] = useState<TransactionFilter>(EMPTY_TRANSACTION_FILTER);
    const [editing, setEditing] = useState<TransactionRow | null>(null);
    const [adding, setAdding] = useState(false);
    const [cancelling, setCancelling] = useState<TransactionRow | null>(null);
    const [, startTransition] = useTransition();
    const fileInput = useRef<HTMLInputElement>(null);
    const uploadFor = useRef<TransactionRow | null>(null);
    const filtered = useMemo(() => filterTransactions(transactions, filter, locale), [transactions, filter, locale]);
    const active = filter.query.trim() !== "" || filter.categories.size > 0 || filter.kinds.size > 0 || filter.notReimbursed || filter.missingReceipt;
    const update = (changes: Partial<TransactionFilter>) => setFilter(previous => ({...previous, ...changes}));
    const columns = useColumns(revivalId, canWrite, {
        onEdit: setEditing,
        onCancel: setCancelling,
        onUpload: transaction => {
            uploadFor.current = transaction;
            fileInput.current?.click();
        },
        onRemoveReceipt: transaction => startTransition(async () => {
            receiptFeedback(await removeReceipt(transaction.id), t("Budget.receiptRemoved"));
        }),
    });
    const categoryOptions = useMemo(() => {
        const held = new Map(transactions.map(transaction => [transaction.category.id, transaction.category]));

        return [...held.values()].map(category => ({label: catalogName(category, locale), value: category.id, groupLabel: t(`Budget.kinds.${category.kind}`)}));
    }, [transactions, locale, t]);

    return (
        <div className="flex flex-col gap-6">
            <DataTable columns={columns} data={filtered} filtered={active} initialSorting={[{id: "date", desc: true}]}
                       onRowClick={canWrite ? (transaction => !transaction.cancelled && setEditing(transaction)) : undefined}
                       rowClassName={transaction => transaction.cancelled && "text-muted-foreground line-through decoration-muted-foreground/50"}
                       empty={<DataEmpty title={t("Budget.noTransactions")} description={canWrite ? t("Budget.noTransactionsHint") : t("Budget.noTransactionsReadOnly")}/>}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="relative w-full sm:w-75">
                            <Input placeholder={t("Budget.filterTransactions")} value={filter.query} onChange={change => update({query: change.target.value})}
                                   aria-label={t("Common.search")} className="h-8 pr-8"/>
                            {filter.query && (
                                <Button variant="ghost" size="icon" className="absolute top-0 right-0 h-8 w-8 hover:bg-transparent"
                                        aria-label={t("Common.clearSearch")} onClick={() => update({query: ""})}>
                                    <X className="h-3 w-3"/>
                                </Button>
                            )}
                        </div>
                        {categoryOptions.length > 0 && (
                            <DataFilter title={t("Budget.category")} options={categoryOptions} selectedValues={filter.categories}
                                        onSelect={categories => update({categories})} onClear={() => update({categories: new Set()})}/>
                        )}
                        <DataFilter title={t("Budget.kind")} options={(["INCOME", "COST"] as const).map(kind => ({label: t(`Budget.kinds.${kind}`), value: kind}))}
                                    selectedValues={filter.kinds} onSelect={kinds => update({kinds})} onClear={() => update({kinds: new Set()})}/>
                        <ToggleFilter pressed={filter.notReimbursed} onChange={notReimbursed => update({notReimbursed})}>{t("Budget.notReimbursed")}</ToggleFilter>
                        <ToggleFilter pressed={filter.missingReceipt} onChange={missingReceipt => update({missingReceipt})}>{t("Budget.missingReceipt")}</ToggleFilter>
                        {active && (
                            <Button variant="ghost" onClick={() => setFilter(EMPTY_TRANSACTION_FILTER)} className="h-8 px-2 lg:px-3">
                                <X className="mr-2 h-4 w-4"/>
                                {t("Common.reset")}
                            </Button>
                        )}
                        <UrlSwitch param="cancelled" shown={showCancelled} label={t("Budget.showCancelled")}/>
                    </div>
                    {canWrite && <Button onClick={() => setAdding(true)}><Plus/>{t("Budget.newTransaction")}</Button>}
                </div>
            </DataTable>
            {canWrite && (
                <input ref={fileInput} type="file" className="hidden" accept={RECEIPT_TYPES.join(",")} aria-label={t("Budget.receipt")} data-testid="receipt-upload"
                       onChange={change => {
                           const file = change.target.files?.[0];
                           const transaction = uploadFor.current;

                           change.target.value = "";
                           if (file && transaction) {
                               startTransition(async () => {
                                   receiptFeedback(await uploadReceipt(transaction.id, file), t("Budget.receiptUploaded"));
                               });
                           }
                       }}/>
            )}
            {(adding || editing) && (
                <TransactionDialog key={editing?.id ?? "new"} revivalId={revivalId} categories={categories} lines={lines} members={members}
                                   transaction={editing} onOpenChange={open => {
                    if (!open) {
                        setAdding(false);
                        setEditing(null);
                    }
                }}/>
            )}
            {cancelling && <CancelDialog transaction={cancelling} revivalId={revivalId} onOpenChange={open => !open && setCancelling(null)}/>}
        </div>
    );
}
