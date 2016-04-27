'use strict';
import * as vscode from 'vscode';
import * as solc from 'solc';
import * as fs from 'fs';
import * as path from 'path';
import * as fsex from 'fs-extra';
import {compile, compileAndHighlightErrors} from './compiler';
import {ContractCollection} from './contractsCollection';

let diagnosticCollection: vscode.DiagnosticCollection;

//this needs to be moved to a server
export function highlightErrors(eventArgs: vscode.TextDocumentChangeEvent) {
    if (eventArgs.contentChanges.length > 0 && eventArgs.contentChanges[0].text !== "\r\n") {
        let editor = vscode.window.activeTextEditor;
        let contractsCollection = new ContractCollection();
        let contractCode = editor.document.getText();
        let contractPath = editor.document.fileName;
        contractsCollection.addContractAndResolveImports(contractPath, contractCode);
        compileAndHighlightErrors(contractsCollection.contracts, diagnosticCollection);
    }
}

export function initDiagnosticCollection(diagnostics: vscode.DiagnosticCollection) {
    diagnosticCollection = diagnostics;
}

export function compileActiveContract() {

    let editor = vscode.window.activeTextEditor;
    if (!editor) {
        return; // We need something open
    }
    
    if(path.extname(editor.document.fileName) !== '.sol'){
        vscode.window.showWarningMessage('This not a solidity file (*.sol)');
        return;
    }

    //Check if is folder, if not stop we need to output to a bin folder on rootPath
    if (vscode.workspace.rootPath === undefined) {
        vscode.window.showWarningMessage('Please open a folder in Visual Studio Code as a workspace');
        return;
    }

    let contractsCollection = new ContractCollection();
    let contractCode = editor.document.getText();
    let contractPath = editor.document.fileName;
    contractsCollection.addContractAndResolveImports(contractPath, contractCode);
    compile(contractsCollection.contracts, diagnosticCollection, contractPath);

}

