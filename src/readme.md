#Backend API

##Pre Login
###index.html
    - PASS
###sign-up.html
    - POST /user/signup
        request
            {
                mail: "",
                password: "",
            }
        response
            {
                msg: "succesfully signed up.",
                data: {
                }
            }
            {
                msg: "this email already exists",
                data: {
                }
            }
###login.html
    - POST /user/login
        request
            {
                username: "",
                password: ""
            }
        response
            {
                msg: "succesfully logged in.",
                data: {
                    token: ""
                }
            }
            {
                msg: "invalid credentials",
                data: {
                }
            }

##After Login
    - JWT Bearer token is needed for each of the requests!
###dashboard.html
    - GET /folder/list
        response
            {
                msg: "succesfully retrieved folders.",
                data: {
                    folders: [
                        {
                            folderId: 12345,
                            folderName: "folder1",
                            documentCount: 3
                        }
                    ]
                }
            }
        notes
            folder list should be given from newest to oldest.
    - POST /folder/create
        request
            {
                folderName: "abcd"
            }
        response
            {
                msg: "succesfully created folder.",
                data: {
                    folder: {
                        folderName: "folder1",
                        folderId: 12345,
                        documentCount: 0
                    }
                }
            }

###folder.html
    - POST /folder/upload-files
        request
            {
                folderId: 12345,
                fileDataListToUpload: [
                    {}, {}, {}
                ]
            }
        response
            {
                msg: "succesfully uploaded files.",
                data: {
                }
            }
    - POST /document/list
        request
            {
                folderId: 12345
            }
        response
            {
                msg: "succesfully retrieved documents.",
                data: {
                    documentsData: [
                        {
                            docId: "12345"
                        }
                    ]
                }
            }
    - POST /document/analysis
        request
            {
                docId: 12345
            }
        response:
            {data: {analysisId: 12345}, msg: "analysis started"}
            {data: {analysisId: 12345}, msg: "analysis already exists"}
    - POST /analysis/status
        request
            {
                analysisId: 12345
            }
        response:
            {data: {analysisId: 12345}, msg: "analysis in progress"}
            {data: {analysisId: 12345}, msg: "analysis is finished"}

###overview.html
    - POST /analysis/results
        request
            {
                analysisId: 12345
            }
        response:
            {
                msg: "succesfully retrieved documents.",
                data: {
                    documentsData: [

                    ]
                }
            }
    - POST /user/collected-docs
        request
            {
                analysisId: 12345
            }
        response:
            {
                msg: "succesfully retrieved saved data.",
                data: {
                    collectedDocs: [],
                }
            }
    - GET /user/weight-set-list
        response:
            {
                msg: "succesfully retrieved saved data.",
                data: {
                    weightSetList: [

                    ]
                }
            }