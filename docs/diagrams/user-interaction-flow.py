from diagrams import Diagram
from diagrams.programming.flowchart import Action, Decision, StartEnd, Document

with Diagram("User Interaction Flow", show=False, filename="user-interaction-flow"):
    start = StartEnd("User Visits\nWebsite")
    
    # Language and theme decisions
    lang_pref = Decision("Language\nPreference?")
    theme_pref = Decision("Theme\nPreference?")
    
    # Language options
    en = Action("Display in\nEnglish")
    es = Action("Display in\nSpanish")
    pt = Action("Display in\nPortuguese")
    
    # Theme options
    light = Action("Apply Light\nTheme")
    dark = Action("Apply Dark\nTheme")
    
    # User actions
    browse = Action("Browse\nWebsite Content")
    request_access = Decision("Request\nRepository Access?")
    
    # Access request flow
    fill_form = Action("Fill Access\nRequest Form")
    submit = Action("Submit\nRequest")
    
    # End states
    end_browse = StartEnd("Continue\nBrowsing")
    end_request = StartEnd("Wait for\nAccess Approval")
    
    # Flow connections
    start >> lang_pref
    
    # Language selection flow
    lang_pref >> en
    lang_pref >> es
    lang_pref >> pt
    
    # Theme selection flow
    en >> theme_pref
    es >> theme_pref
    pt >> theme_pref
    
    theme_pref >> light
    theme_pref >> dark
    
    # User journey flow
    light >> browse
    dark >> browse
    
    browse >> request_access
    
    # Access request branch
    request_access >> fill_form >> submit >> end_request
    
    # Continue browsing branch
    request_access >> end_browse
