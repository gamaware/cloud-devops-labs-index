from diagrams import Diagram, Cluster
from diagrams.programming.language import JavaScript, Html5
from diagrams.programming.flowchart import Database, Document, Action
from diagrams.generic.device import Mobile, Tablet
from diagrams.generic.os import Windows, LinuxGeneral
from diagrams.generic.network import Firewall

with Diagram("Website Architecture", show=False, filename="website-architecture"):
    with Cluster("Client Side"):
        browser = Action("Web Browser")
        
        with Cluster("Pages"):
            index = Html5("index.html")
            access = Html5("access-request.html")
        
        with Cluster("Features"):
            theme = JavaScript("Theme Toggle")
            lang = JavaScript("Language Selector")
            form = JavaScript("Access Request Form")
        
        with Cluster("Local Storage"):
            storage = Database("localStorage")
            theme_pref = Document("Theme Preference")
            lang_pref = Document("Language Preference")
    
    with Cluster("GitHub"):
        pages = Action("GitHub Pages")
        issues = Action("GitHub Issues")
        actions = Action("GitHub Actions")
        repos = Action("Private Repositories")
    
    with Cluster("User Devices"):
        desktop = Windows("Desktop")
        mobile = Mobile("Mobile")
        tablet = Tablet("Tablet")
        linux = LinuxGeneral("Linux")
    
    # Client-side connections
    browser >> index
    browser >> access
    
    index >> theme
    index >> lang
    access >> theme
    access >> lang
    access >> form
    
    theme >> storage
    lang >> storage
    storage >> theme_pref
    storage >> lang_pref
    
    # GitHub connections
    form >> issues
    issues >> actions
    actions >> repos
    
    pages >> index
    pages >> access
    
    # User device connections
    desktop >> browser
    mobile >> browser
    tablet >> browser
    linux >> browser
